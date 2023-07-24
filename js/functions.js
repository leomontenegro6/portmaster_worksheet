// Global variables, used in the functions below
let $processingModal = null;

// Functions.
function getFirebaseCredentials() {
    let request = new XMLHttpRequest();
    request.open("GET", "firebase-credentials.json", false);
    request.send(null);
    return JSON.parse(request.responseText);
}

function fetchGames() {
    db.collection("games").get().then((querySnapshot) => {
        let games = [];
        querySnapshot.forEach((doc) => {
            games.push({
                ...doc.data(),
                id: doc.id
            });
        });
        populateGameTable(games);
    });
}

function editGame(id, data, callback) {
    db.collection("games").doc(id).update(data).then(() => {
        if (callback) callback();
    });
}

function deleteGame(id, callback) {
    db.collection("games").doc(id).delete().then(() => {
        if (callback) callback();
    });
}

function populateGameTable(games) {
    let dataTablesObject = $tableGame.DataTable();

    // Clearing table, before populating it through jQuery DataTables API.
    dataTablesObject.clear().draw();

    games.forEach(game => {
        // Game name, also containing its URL as a link.
        let $gameNameDiv = $("<div />").html(
            $('<a />').attr('href', game.url).html(game.name)
        );

        let comment = game.comment ?? game.comments;
        let status = game.status ?? 'Done';

        // Edit and delete buttons.
        let $divActions = $('<div />').addClass('btn-group btn-group-sm').attr('role', 'group').append(
            $('<button />').addClass('btn btn-outline-primary edit').attr('title', 'Edit').html(
                $('<i />').addClass('bi bi-pencil-fill')
            )
        ).append(
            $('<button />').addClass('btn btn-outline-danger delete').attr('title', 'Delete').html(
                $('<i />').addClass('bi bi-trash3-fill')
            )
        );

        // Adding table row through jQuery DataTables API.
        let rowNode = dataTablesObject.row.add([
            $gameNameDiv[0].outerHTML,
            comment,
            status,
            $divActions[0].outerHTML,
        ]).draw().node();
        let $tr = $(rowNode);

        $tr.find('button.edit').on('click', function() {
            let $formEdit = $('#form-edit-template').clone().removeClass('d-none');
            let $divGameName = $formEdit.find('.show-game-name');
            let $textareaComments = $formEdit.find('.edit-game-comments');
            let $selectStatus = $formEdit.find('.edit-game-status');

            $divGameName.attr('id', 'showGameName').removeClass('show-game-name').html(game.name);
            $textareaComments.attr('id', 'editGameComments').removeClass('edit-game-comments').val(comment);
            $selectStatus.attr('id', 'editGameStatus').removeClass('edit-game-status').val(status);

            bootbox.confirm({
                title: 'Edit Game',
                message: $formEdit,
                buttons: {
                    confirm: {
                        label: 'Save',
                        className: 'btn-success'
                    },
                    cancel: {
                        label: 'Cancel',
                        className: 'btn-secondary'
                    }
                },
                animate: false,
                callback: function (submit) {
                    if (submit) {
                        const editedComment = $textareaComments.val();
                        const editedStatus = $selectStatus.val();

                        showLoadingIndicatorModal();

                        const gameData = {
                            comment: editedComment,
                            status: editedStatus,
                        };

                        editGame(game.id, gameData, function() {
                            hideLoadingIndicatorModal();
                            fetchGames();
                            showAlertModal('Game edited successfully.');
                        });
                    }
                }
            });
        });

        // Adding onclick event to the Delete button.
        $tr.find('button.delete').on('click', function() {
            bootbox.confirm({
                title: 'Confirmation',
                message: 'Are you sure you want to delete this record?',
                animate: false,
                buttons: {
                    confirm: {
                        label: 'Yes',
                        className: 'btn-danger'
                    },
                    cancel: {
                        label: 'No',
                        className: 'btn-secondary'
                    }
                },
                callback: function (result) {
                    if (result) {
                        showLoadingIndicatorModal();

                        deleteGame(game.id, function() {
                            hideLoadingIndicatorModal();
                            fetchGames();
                            showAlertModal('Game deleted successfully.');
                        });
                    }
                }
            });
        });
    });

    gameCount.textContent = `${games.length} Games`;
}

function showAlertModal(message, title='Info') {
    return bootbox.alert({
        title: title,
        message: message,
    });
}

function showLoadingIndicatorModal() {
    const $divSpinner = $('<div />').addClass('text-center').html(
        $('<div />').addClass('spinner-border').attr('role', 'status').html(
            $('<span />').addClass('visually-hidden').html('Processing...')
        )
    ).append(
        $('<span />').addClass('ms-2').css('verticalAlign', 'super').html('Processing...')
    );
    $processingModal = bootbox.dialog({
        message: $divSpinner,
        animate: false,
        closeButton: false
    });
    return $processingModal;
}

function hideLoadingIndicatorModal() {
    return $processingModal.modal('hide');
}
