function redirect(GoTo){var url=new URL(window.location.href).origin;if("/"===GoTo)return window.location.href=url;window.location.href=url+"/"+GoTo}localStorage.getItem("shopping.cart")&&!["store/checkout","account"].includes(window.location.pathname.substring(1,window.location.pathname.length))&&localStorage.removeItem("shopping.cart");