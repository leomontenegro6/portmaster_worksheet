$(function() {
    showLoadingIndicatorModal();

    userbase
        .init({ appId: "a388dcbf-6ac1-4c1d-9ed0-db8f6d3bfae8" })
        .then((session) => (session.user ? showTodos(session.user) : showAuth()))
        .catch(() => showAuth())
        .finally(() => (hideLoadingIndicatorModal()));

    $('#login-form').on('submit', handleLogin);
    $('#signup-form').on('submit', handleSignUp);

    $('#logout-button').on('click', handleLogout).hide();

    $('#entry-view, #auth-view').hide();
});
