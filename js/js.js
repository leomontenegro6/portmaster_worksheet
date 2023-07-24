// Firebase configuration
const firebaseConfig = getFirebaseCredentials();

// Initialize Firebase.
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Element selectors to be used below.
const $buttonThemeChanger = $('#theme-changer');
const $formCreateGame = $('#gameForm');
const $inputGameName = $('#gameName');
const $inputGameUrl = $('#gameURL');
const $textareaGameComments = $('#gameComments');
const $spanGameCount = $('#gameCount');
const $tableGame = $('#gameTable');

// Event for creating game records in the database.
$formCreateGame.on('submit', function(e) {
    e.preventDefault();

    const gameData = {
        name: $inputGameName.val(),
        url: $inputGameUrl.val(),
        comment: $textareaGameComments.val(),
    };

    showLoadingIndicatorModal();

    // Check for duplicates.
    db.collection("games").where("name", "==", gameData.name).get().then((querySnapshot) => {
        // Preventing creating games with same name
        if (!querySnapshot.empty) {
            hideLoadingIndicatorModal();
            showAlertModal("A game with this name already exists.");
            return;
        } 
        
        db.collection("games").where("url", "==", gameData.url).get().then((querySnapshot) => {
            // Preventing creating games with same URL
            if (!querySnapshot.empty) {
                hideLoadingIndicatorModal();
                showAlertModal("A game with this URL already exists.");
                return;
            }
            
            // If reached here, proceed with game record creation.
            hideLoadingIndicatorModal();
            db.collection("games").add(gameData).then(() => {
                // Clearing form fields
                $inputGameName.add($inputGameUrl).add($textareaGameComments).val('');

                // Refetch games after adding to display the latest data
                fetchGames();
            });
        });
    });
});

// Instantiate the theme changer button behavior
$buttonThemeChanger.on('click.changeTheme', function(event, wasTriggered) {
    const $button = $(this);
    const $iIcon = $button.children('i.bi');
    const $html = $('html');

    let theme = '';
    if (wasTriggered) {
        theme = localStorage.getItem('theme') ?? 'light';
    } else {
        theme = ($button.hasClass('btn-light')) ? ('dark') : ('light');
    }

    if (theme == 'dark') {
        $button.removeClass('btn-light').addClass('btn-dark');
        $iIcon.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
    } else {
        $button.removeClass('btn-dark').addClass('btn-light');
        $iIcon.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
    }
    $html.attr('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
}).trigger('click.changeTheme', true);

// Initialize the DataTable.
$tableGame.DataTable({
    pageLength: 50,
    autoWidth: false,
    columns: [
        { "width": '35%' },
        { "width": '50%' },
        { "width": '10%' },
        { "width": '5%' },
    ],
    initComplete: function() {
        // Fetch games when the page loads.
        fetchGames();
    }
});
