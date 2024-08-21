const filterInput = document.getElementById('filterInput');
const clearInputFillter = document.getElementById('clearInputFillter');

clearInputFillter.onclick = () => {
    filterInput.value = '';
    loadCookies('');
}