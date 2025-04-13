const filterInput = document.getElementById('filterInput');
const clearInputFillter = document.getElementById('clearInputFillter');

clearInputFillter.onclick = () => {
    if (filterInput.value != '') {
        filterInput.value = '';
        loadCookies('');
    }
}