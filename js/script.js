$(function () {

    var baseUrl = 'https://kodilla.com/pl/bootcamp-api';
    var myHeaders = {
        'X-Client-Id': '2850',
        'X-Auth-Token': 'ac567c640e36d94b88238718197d64ac'
    };

    $.ajaxSetup({
        headers: myHeaders
    });

    $.ajax({
        url: baseUrl + '/board',
        method: 'GET',
        success: function (response) {
            setupColumns(response.columns);
        }
    });

    function setupColumns(columns) {
        columns.forEach(function (column) {
            var col = new Column(column.id, column.name);
            board.addColumn(col);
            setupCards(col, column.cards);
        });
    }

    function setupCards(col, cards) {
        cards.forEach(function (card) {
            var cardObj = new Card(card.id, card.name, card.bootcamp_kanban_column_id);
            col.addCard(cardObj);
        });
    }


    //COLUMN

    function Column(id, name) {
        var self = this;

        this.id = id;
        this.name = name || 'No name given';
        this.$element = createColumn();

        function createColumn() {
            var $column = $('<div>').addClass('column').data('id', id);
            var $columnTitle = $('<h2>').addClass('column-title').text(self.name);
            var $columnCardList = $('<ul>').addClass('column-card-list');
            var $columnDelete = $('<button>').addClass('btn-delete').text('x');
            var $columnAddCard = $('<button>').addClass('add-card').text('Add a card');

            $columnDelete.click(function () {
                self.removeColumn();
            });

            $columnAddCard.click(function (event) {
                var cardName = prompt("Enter the name of the card");
                event.preventDefault();
                $.ajax({
                    url: baseUrl + '/card',
                    method: 'POST',
                    data: {
                        name: cardName,
                        bootcamp_kanban_column_id: self.id
                    },
                    success: function (response) {
                        var card = new Card(response.id, cardName);
                        self.addCard(card);
                    }
                });
            });

            function changeColumnTitle() {
                var newColumnName = prompt('Enter new column name');
                if (newColumnName === (null || '')) newColumnName = 'No name given';
                $.ajax({
                    url: baseUrl + '/column/' + self.id,
                    method: 'PUT',
                    data: {
                        id: self.id,
                        name: newColumnName
                    },
                    success: function (response) {
                        $columnTitle.text(newColumnName);
                    }
                });
            }

            $columnTitle.on('touchend dblclick', changeColumnTitle);

            $columnCardList.on("sortreceive", function (event, ui) {
                var cardId = ui.item.data('id');
                var cardName = ui.item.data('description');
                $.ajax({
                    url: baseUrl + '/card/' + cardId,
                    method: 'PUT',
                    data: {
                        id: cardId,
                        name: cardName,
                        bootcamp_kanban_column_id: id
                    },
                });
            });

            $column.append($columnTitle)
                .append($columnDelete)
                .append($columnAddCard)
                .append($columnCardList);
            return $column;
        }
    }

    Column.prototype = {
        addCard: function (card) {
            this.$element.children('ul').append(card.$element);
        },
        removeColumn: function () {
            var self = this;
            $.ajax({
                url: baseUrl + '/column/' + self.id,
                method: 'DELETE',
                success: function (response) {
                    self.$element.remove();
                }
            });
        },
    };


    //CARD

    function Card(id, name) {
        var self = this;

        this.id = id;
        this.name = name || 'No description given';
        this.$element = createCard();

        function createCard() {
            var $card = $('<li>').addClass('card').data('id', id).data('description', name);
            var $cardDescription = $('<p>').addClass('card-description').text(self.name);
            var $cardDelete = $('<button>').addClass('btn-delete').text('x');

            $cardDelete.click(function () {
                self.removeCard();
            });

            $card.on('touchend dblclick', changeCardDescription);

            function changeCardDescription() {
                var columnId = $card.closest('.column').data('id');
                var newCardDescription = prompt('Enter new card description') || 'No description given';
                $.ajax({
                    url: baseUrl + '/card/' + self.id,
                    method: 'PUT',
                    data: {
                        id: self.id,
                        name: newCardDescription,
                        bootcamp_kanban_column_id: columnId
                    },
                    success: function (response) {
                        $cardDescription.text(newCardDescription);
                        $card.data('description', newCardDescription);
                    }
                });
            }

            $card.append($cardDelete)
                .append($cardDescription);

            return $card;
        }
    }

    Card.prototype = {
        removeCard: function () {
            var self = this;
            $.ajax({
                url: baseUrl + '/card/' + self.id,
                method: 'DELETE',
                success: function () {
                    self.$element.remove();
                }
            });
        }
    };


    //BOARD

    var board = {
        name: 'Kanban Board',
        addColumn: function (column) {
            this.$element.append(column.$element);
            initSortable();
        },
        $element: $('#board .column-container')
    };

    function initSortable() {
        $('.column-card-list').sortable({
            connectWith: '.column-card-list',
            placeholder: 'card-placeholder',
        }).disableSelection();
        $('.column-container').sortable({
            placeholder: 'column-placeholder',
        }).disableSelection();
    }

    $('.create-column')
        .click(function () {
            var columnName = prompt('Enter a column name');
            $.ajax({
                url: baseUrl + '/column',
                method: 'POST',
                data: {
                    name: columnName
                },
                success: function (response) {
                    var column = new Column(response.id, columnName);
                    board.addColumn(column);
                }
            });
        });

});