function storeCartAdd() {
    const SELECTED_PLAN = document.getElementById('store.selectedplan').value;
    localStorage.setItem('shopping.cart', SELECTED_PLAN);
    redirect('store/checkout');
};