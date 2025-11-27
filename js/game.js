// game.js
(function(){
  // utilities
  const qs = (s) => new URLSearchParams(location.search).get(s);
  const mode = qs('mode') || 'ai'; // 'ai' or '2p'
  const boardEl = document.getElementById('board');
  const modeLabel = document.getElementById('modeLabel');
  const playersInfo = document.getElementById('playersInfo');
  const restartBtn = document.getElementById('restartBtn');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalRestart = document.getElementById('modalRestart');
  const modalHome = document.getElementById('modalHome');

  const themeToggle = document.getElementById('themeToggleGame');
  const body = document.getElementById('gameBody');

  // theme from storage
  const theme = localStorage.getItem('tictactoe_theme') || 'light';
  if(theme === 'dark'){ body.classList.add('dark'); themeToggle.checked = true; }
  themeToggle.addEventListener('change', () => {
    if(themeToggle.checked){ body.classList.add('dark'); localStorage.setItem('tictactoe_theme','dark'); }
    else { body.classList.remove('dark'); localStorage.setItem('tictactoe_theme','light'); }
  });

  // background
  const savedBg = localStorage.getItem('tictactoe_game_bg');
  if(savedBg){
    document.body.style.backgroundImage = `url(${savedBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  }

  // game state
  let board = Array(9).fill(null); // 'X' or 'O' or null
  let currentPlayer = 'X'; // X always starts
  let isGameOver = false;
  let playerSymbols = { human: 'X', ai: 'O' }; // in ai mode
  let twoPlayers = null; // holds names/colors for 2p
  let scores = JSON.parse(localStorage.getItem('tictactoe_2p_scores') || 'null');

  // initialize
  function init(){
    boardEl.innerHTML = '';
    for(let i=0;i<9;i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }
    if(mode === 'ai'){
      modeLabel.innerText = 'Mode: AI';
      playersInfo.innerHTML = `<p>You: X — Computer: O</p>`;
      currentPlayer = 'X';
    } else {
      modeLabel.innerText = 'Mode: 2 Players (local)';
      // load players data from storage
      twoPlayers = JSON.parse(localStorage.getItem('tictactoe_2p_players') || '{}');
      if(!twoPlayers || !twoPlayers.p1){
        // fallback to defaults
        twoPlayers = { p1: { name: 'Player 1', color: 'blue' }, p2: { name: 'Player 2', color: 'red' } };
      }
      playersInfo.innerHTML = `
        <p><span style="font-weight:700">${twoPlayers.p1.name}</span> (<span class="color-swatch" style="background:${twoPlayers.p1.color}"></span>) — X</p>
        <p><span style="font-weight:700">${twoPlayers.p2.name}</span> (<span class="color-swatch" style="background:${twoPlayers.p2.color}"></span>) — O</p>
      `;
      currentPlayer = 'X';
      if(!scores) scores = { p1Wins:0, p2Wins:0, draws:0 };
      // ensure players stored for persistence
      localStorage.setItem('tictactoe_2p_players', JSON.stringify(twoPlayers));
    }
    isGameOver = false;
    board = Array(9).fill(null);
    render();
  }

  function render(){
    // fill cells
    document.querySelectorAll('.cell').forEach(cell=>{
      const i = parseInt(cell.dataset.index,10);
      const val = board[i];
      cell.textContent = val ? val : '';
      cell.style.background = val ? getColorForValue(val) : '';
    });
  }

  function getColorForValue(val){
    if(mode === '2p'){
      // X corresponds to player1, O to player2
      if(val === 'X') return twoPlayers.p1.color;
      return twoPlayers.p2.color;
    } else {
      return val === 'X' ? 'rgba(37,99,235,0.9)' : 'rgba(16,185,129,0.9)';
    }
  }

  function onCellClick(e){
    if(isGameOver) return;
    const idx = Number(e.currentTarget.dataset.index);
    if(board[idx]) return; // occupied

    if(mode === 'ai'){
      // human is X
      if(currentPlayer !== 'X') return;
      board[idx] = 'X';
      currentPlayer = 'O';
      render();
      const win = checkWinner(board);
      if(win) return finishGame(win);
      // AI move after small delay for UX
      setTimeout(()=> {
        const aiMove = bestMove(board, 'O');
        board[aiMove] = 'O';
        currentPlayer = 'X';
        render();
        const win2 = checkWinner(board);
        if(win2) return finishGame(win2);
      }, 350);
    } else {
      // 2 player mode — alternate turns
      board[idx] = currentPlayer;
      const last = currentPlayer;
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
      render();
      const win = checkWinner(board);
      if(win) return finishGame(win);
    }
  }

  function checkWinner(b){
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for(const [a,b1,c] of lines){
      if(board[a] && board[a] === board[b1] && board[a] === board[c]){
        return { winner: board[a], line: [a,b1,c] };
      }
    }
    if(board.every(Boolean)) return { winner: 'draw' };
    return null;
  }

  function finishGame(result){
    isGameOver = true;
    if(result.winner === 'draw'){
      showModal('Draw!', "It's a draw. Try again!");
      // update draw score for 2p
      if(mode === '2p'){
        scores.draws = (scores.draws || 0) + 1;
        localStorage.setItem('tictactoe_2p_scores', JSON.stringify(scores));
      }
      return;
    }
    const who = result.winner;
    if(mode === 'ai'){
      if(who === 'O'){
        showModal('Better luck next time', 'The AI won this round.');
      } else {
        showModal('Wow! You beat the warrior', 'You beat the AI!');
      }
    } else {
      // map winner to player
      const msg = who === 'X' ? `${twoPlayers.p1.name} (X) wins!` : `${twoPlayers.p2.name} (O) wins!`;
      showModal('We have a winner', msg);
      // update scores
      if(who === 'X') scores.p1Wins = (scores.p1Wins||0) + 1;
      else scores.p2Wins = (scores.p2Wins||0) + 1;
      localStorage.setItem('tictactoe_2p_scores', JSON.stringify(scores));
    }
  }

  function showModal(title, message){
    modalTitle.textContent = title;
    modalMessage.textContent = message;
    modal.classList.remove('hidden');
  }

  modalRestart.addEventListener('click', ()=>{
    modal.classList.add('hidden');
    init();
  });
  modalHome.addEventListener('click', ()=>{
    window.location = 'index.html';
  });
  restartBtn.addEventListener('click', init);

  // ====== Minimax for unbeatable AI ======
  // We'll implement minimax for Tic-Tac-Toe with scoring: +10 for AI win, -10 for human win, 0 draw
  function bestMove(bd, player){
    // returns best index
    const available = bd.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(available.length === 0) return -1;

    let bestScore = -Infinity;
    let move = available[0];

    for(const i of available){
      const copy = bd.slice();
      copy[i] = player;
      const score = minimax(copy, 0, false, player);
      if(score > bestScore){
        bestScore = score;
        move = i;
      }
    }
    return move;
  }

  function minimax(bd, depth, isMaximizing, aiPlayer){
    const result = checkWinnerStatic(bd);
    if(result){
      if(result === 'draw') return 0;
      return (result === aiPlayer) ? 10 - depth : depth - 10; // prefer faster wins, slower losses
    }

    const avail = bd.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(isMaximizing){
      let best = -Infinity;
      for(const i of avail){
        bd[i] = aiPlayer;
        const score = minimax(bd, depth+1, false, aiPlayer);
        bd[i] = null;
        best = Math.max(score, best);
      }
      return best;
    } else {
      const human = aiPlayer === 'X' ? 'O' : 'X';
      let best = Infinity;
      for(const i of avail){
        bd[i] = human;
        const score = minimax(bd, depth+1, true, aiPlayer);
        bd[i] = null;
        best = Math.min(score, best);
      }
      return best;
    }
  }

  function checkWinnerStatic(b){
    // returns 'X' or 'O' or 'draw' or null
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for(const [a,b1,c] of lines){
      if(b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
    }
    if(b.every(Boolean)) return 'draw';
    return null;
  }

  // init on load
  init();

})();
