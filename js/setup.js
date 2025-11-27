// setup.js
(function(){
  const form = document.getElementById('twoPlayerForm');
  const p1Color = document.getElementById('p1Color');
  const p2Color = document.getElementById('p2Color');
  const p1Name = document.getElementById('p1Name');
  const p2Name = document.getElementById('p2Name');
  const loadLast = document.getElementById('loadLast');
  const scoresContent = document.getElementById('scoresContent');

  function loadSaved(){
    const saved = JSON.parse(localStorage.getItem('tictactoe_2p_players') || 'null');
    const scores = JSON.parse(localStorage.getItem('tictactoe_2p_scores') || 'null');
    if(saved){
      p1Name.value = saved.p1.name;
      p2Name.value = saved.p2.name;
      p1Color.value = saved.p1.color;
      p2Color.value = saved.p2.color;
    }
    if(scores){
      scoresContent.innerHTML = `
        <p>${saved.p1.name} wins: ${scores.p1Wins || 0}</p>
        <p>${saved.p2.name} wins: ${scores.p2Wins || 0}</p>
        <p>Draws: ${scores.draws || 0}</p>
      `;
    } else {
      scoresContent.innerText = 'No saved matches yet.';
    }
  }

  loadLast.addEventListener('click', loadSaved);
  loadSaved();

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    if(p1Color.value === p2Color.value){
      alert('Players cannot pick the same color. Choose different colors.');
      return;
    }
    const players = {
      p1: { name: p1Name.value.trim() || 'Player 1', color: p1Color.value },
      p2: { name: p2Name.value.trim() || 'Player 2', color: p2Color.value }
    };
    localStorage.setItem('tictactoe_2p_players', JSON.stringify(players));
    // ensure scores object exists
    if(!localStorage.getItem('tictactoe_2p_scores')){
      localStorage.setItem('tictactoe_2p_scores', JSON.stringify({p1Wins:0,p2Wins:0,draws:0}));
    }
    // go to game
    window.location = 'game.html?mode=2p';
  });
})();
