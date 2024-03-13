function isActiveRoute(route, currentRoute) {
    // la classe active va creata a css, per togliere opacity
    return route === currentRoute ? 'active' : '';
}

module.exports = { isActiveRoute }
