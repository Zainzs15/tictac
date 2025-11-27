(function(){
const qs = (s) => new URLSearchParams(location.search).get(s);
const mode = qs('mode') || 'ai';
const diff = qs('diff') || 'easy';  // read difficulty
const difficultyLabel = document.getElementById('difficultyLabel');

// Show difficulty only in AI mode
if(mode === 'ai') {
  difficultyLabel.innerHTML = `<p>Difficulty: <b>${diff.charAt(0).toUpperCase() + diff.slice(1)}</b></p>`;
}


  // DOM Elements
  const boardEl = document.getElementById('board');
  const modeLabel = document.getElementById('modeLabel');
  const playersInfo = document.getElementById('playersInfo');
  const restartBtn = document.getElementById('restartBtn');
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalMessage = document.getElementById('modalMessage');
  const modalRestart = document.getElementById('modalRestart');
  const modalHome = document.getElementById('modalHome');

  

  // Game state
  let board = Array(9).fill(null);
  let currentPlayer = 'X';
  let isGameOver = false;
  let twoPlayers = null;
  let scores = JSON.parse(localStorage.getItem('tictactoe_2p_scores') || 'null');

  // Initialize board
  function init(){
    boardEl.innerHTML = '';
    for(let i=0;i<9;i++){
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      boardEl.appendChild(cell);
    }

    if(mode==='ai'){
      modeLabel.innerText = `Mode: AI (${diff.charAt(0).toUpperCase() + diff.slice(1)})`;
      playersInfo.innerHTML = `<p>You: X — Computer: O</p>`;
      currentPlayer = 'X';
    } else {
      modeLabel.innerText = 'Mode: 2 Players (local)';
      twoPlayers = JSON.parse(localStorage.getItem('tictactoe_2p_players') || '{}');
      if(!twoPlayers || !twoPlayers.p1) twoPlayers = {p1:{name:'Player 1',color:'blue'},p2:{name:'Player 2',color:'red'}};
      playersInfo.innerHTML = `
        <p><b>${twoPlayers.p1.name}</b> (<span class="color-swatch" style="background:${twoPlayers.p1.color}"></span>) — X</p>
        <p><b>${twoPlayers.p2.name}</b> (<span class="color-swatch" style="background:${twoPlayers.p2.color}"></span>) — O</p>
      `;
      currentPlayer='X';
      if(!scores) scores={p1Wins:0,p2Wins:0,draws:0};
      localStorage.setItem('tictactoe_2p_players',JSON.stringify(twoPlayers));
    }

    isGameOver=false;
    board=Array(9).fill(null);
    render();
  }

  // Render cells
  function render(){
    document.querySelectorAll('.cell').forEach(cell=>{
      const i = parseInt(cell.dataset.index,10);
      const val = board[i];
      cell.textContent = val || '';
      cell.style.background = val ? getColorForValue(val) : 'url(https://png.pngtree.com/thumb_back/fh260/background/20250205/pngtree-soft-pastel-floral-design-light-blue-background-image_16896113.jpg) center/cover no-repeat';
      cell.style.border = `3px solid rgb(${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)},${Math.floor(Math.random()*256)})`;
    });
  }

  function getColorForValue(val){
    if(mode==='2p') return val==='X'?twoPlayers.p1.color:twoPlayers.p2.color;
    return val==='X'?'rgba(37,99,235,0.9)':'rgba(16,185,129,0.9)';
  }

  // Handle click
  function onCellClick(e){
    if(isGameOver) return;
    const idx = Number(e.currentTarget.dataset.index);
    if(board[idx]) return;

    if(mode==='ai'){
      if(currentPlayer!=='X') return;
      board[idx]='X'; currentPlayer='O'; render();
      const win = checkWinner(board); if(win) return finishGame(win);

      setTimeout(()=>{
        const aiMove = getAIMove(board,diff);
        board[aiMove]='O'; currentPlayer='X'; render();
        const win2 = checkWinner(board); if(win2) return finishGame(win2);
      },350);
    } else {
      board[idx]=currentPlayer;
      currentPlayer=currentPlayer==='X'?'O':'X';
      render();
      const win=checkWinner(board); if(win) return finishGame(win);
    }
  }

  // Check winner
  function checkWinner(b){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b1,c] of lines) if(b[a] && b[a]===b[b1] && b[a]===b[c]) return {winner:b[a],line:[a,b1,c]};
    if(b.every(Boolean)) return {winner:'draw'};
    return null;
  }

  // Finish game
  function finishGame(result){
    isGameOver=true;
    setTimeout(()=>{
      if(result.winner==='draw'){
        showModal('Draw!','It\'s a draw!');
        if(mode==='2p'){scores.draws=(scores.draws||0)+1; localStorage.setItem('tictactoe_2p_scores',JSON.stringify(scores));}
        return;
      }
      const who=result.winner;
      if(mode==='ai') showModal(who==='X'?'You Win!':'AI Wins',who==='X'?'You beat the AI!':'AI won this round');
      else{
        const msg=who==='X'?`${twoPlayers.p1.name} (X) wins!`:`${twoPlayers.p2.name} (O) wins!`;
        showModal('We have a winner',msg);
        if(who==='X') scores.p1Wins=(scores.p1Wins||0)+1; else scores.p2Wins=(scores.p2Wins||0)+1;
        localStorage.setItem('tictactoe_2p_scores',JSON.stringify(scores));
      }
      if(result.line) animateWinningLine(result.line);
    },750);
  }

  function showModal(title,msg){modalTitle.textContent=title; modalMessage.textContent=msg; modal.classList.remove('hidden');}

  function animateWinningLine(line){
    line.forEach(i=>{
      const cell=document.querySelector(`.cell[data-index="${i}"]`);
      cell.style.transform='scale(1.2)';
      cell.style.transition='transform 0.75s ease, box-shadow 0.75s ease';
      cell.style.boxShadow='0 0 20px rgb(255,255,0),0 0 30px rgb(255,255,0)';
    });
  }

  modalRestart.addEventListener('click',()=>{modal.classList.add('hidden'); init();});
  modalHome.addEventListener('click',()=>window.location='index.html');
  restartBtn.addEventListener('click',init);

  // AI difficulty logic
  function getAIMove(bd,difficulty){
    const avail=bd.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(difficulty==='easy') return avail[Math.floor(Math.random()*avail.length)];
    if(difficulty==='medium') return Math.random()<0.5?avail[Math.floor(Math.random()*avail.length)]:bestMove(bd,'O');
    if(difficulty==='hard') return Math.random()<0.8?bestMove(bd,'O'):avail[Math.floor(Math.random()*avail.length)];
    return bestMove(bd,'O'); // extreme
  }

  // Minimax for unbeatable AI
  function bestMove(bd,player){
    const avail=bd.map((v,i)=>v?null:i).filter(v=>v!==null); if(avail.length===0) return -1;
    let bestScore=-Infinity, move=avail[0];
    for(const i of avail){
      const copy=bd.slice();
      copy[i]=player;
      const score=minimax(copy,0,false,player);
      if(score>bestScore){bestScore=score; move=i;}
    }
    return move;
  }

  function minimax(bd,depth,isMax,ai){
    const res=checkWinnerStatic(bd);
    if(res){if(res==='draw') return 0; return (res===ai)?10-depth:depth-10;}
    const avail=bd.map((v,i)=>v?null:i).filter(v=>v!==null);
    if(isMax){let best=-Infinity; for(const i of avail){bd[i]=ai; const score=minimax(bd,depth+1,false,ai); bd[i]=null; best=Math.max(best,score);} return best;}
    else{const human=ai==='X'?'O':'X'; let best=Infinity; for(const i of avail){bd[i]=human; const score=minimax(bd,depth+1,true,ai); bd[i]=null; best=Math.min(best,score);} return best;}
  }

  function checkWinnerStatic(b){
    const lines=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(const [a,b1,c] of lines) if(b[a] && b[a]===b[b1] && b[a]===b[c]) return b[a];
    if(b.every(Boolean)) return 'draw'; return null;
  }

  init();
})();
