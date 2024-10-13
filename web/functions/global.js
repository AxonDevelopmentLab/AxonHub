if (localStorage.getItem('shopping.cart') && !['store/checkout', 'account', 'terms-of-purchase-and-refund'].includes(window.location.pathname.substring(1, window.location.pathname.length))) localStorage.removeItem('shopping.cart');

function redirect(GoTo) {
    const url = new URL(window.location.href).origin;
    if (GoTo === "/") return window.location.href = url;
    window.location.href = `${url}/${GoTo}`;
};