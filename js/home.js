// home.js
(function(){
  const themeCheckbox = document.getElementById('themeCheckbox');
  const body = document.getElementById('body');
  const bgInput = document.getElementById('bgInput');
  const saveBg = document.getElementById('saveBg');
  const clearBg = document.getElementById('clearBg');

  // load theme
  const theme = localStorage.getItem('tictactoe_theme') || 'light';
  if(theme === 'dark'){ body.classList.add('dark'); themeCheckbox.checked = true; }

  themeCheckbox.addEventListener('change', () => {
    if(themeCheckbox.checked){
      body.classList.add('dark');
      localStorage.setItem('tictactoe_theme','dark');
    } else {
      body.classList.remove('dark');
      localStorage.setItem('tictactoe_theme','light');
    }
  });

  // background image saved for game page
  const savedBg = localStorage.getItem('tictactoe_game_bg') || '';
  if(savedBg) bgInput.value = savedBg;

  saveBg.addEventListener('click', () => {
    const url = bgInput.value.trim();
    if(!url){ alert('Paste a valid image URL or clear it.'); return; }
    localStorage.setItem('tictactoe_game_bg', url);
    alert('Background saved for game page.');
  });

  clearBg.addEventListener('click', () => {
    localStorage.removeItem('tictactoe_game_bg');
    bgInput.value = '';
    alert('Background cleared.');
  });

})();
