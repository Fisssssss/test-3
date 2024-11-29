$(document).ready(function() {
    const sessions = ["10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];
    const seatsCount = 10; // Количество мест
    const storageKey = 'reservations';
    let reservations = JSON.parse(localStorage.getItem(storageKey)) || {};

    function populateDatePicker() {
        const today = new Date();
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 7);
        
        $('#datePicker').attr('min', today.toISOString().split('T')[0]);
        $('#datePicker').attr('max', maxDate.toISOString().split('T')[0]);
    }

    function populateSessions() {
        const selectedDate = $('#datePicker').val();
        $('#sessionSelect').empty();
        
        if (selectedDate) {
            const selectedDateObj = new Date(selectedDate);
            const now = new Date();
            const isPastDate = selectedDateObj < now.setHours(0, 0, 0, 0);
            const isToday = selectedDateObj.toDateString() === new Date().toDateString();

            sessions.forEach(session => {
                const sessionTime = new Date(selectedDateObj);
                const [hours, minutes] = session.split(':');
                sessionTime.setHours(hours, minutes);
                
                if (!isPastDate && (!isToday || sessionTime >= now)) {
                    $('#sessionSelect').append(`<option value="${session}">${session}</option>`);
                } else {
                    $('#sessionSelect').append(`<option value="${session}" disabled>${session} (архив)</option>`);
                }
            });
        }
    }

    function renderSeats() {
        const selectedDate = $('#datePicker').val();
        const selectedSession = $('#sessionSelect').val();
        const key = `${selectedDate}-${selectedSession}`;
        const reservedSeats = reservations[key] || [];

        $('#seatsContainer').empty();
        for (let i = 1; i <= seatsCount; i++) {
            const seatClass = reservedSeats.includes(i) ? 'seat reserved' : 'seat';
            $('#seatsContainer').append(`<div class="${seatClass}" data-seat="${i}">${i}</div>`);
        }
    }

    function reserveSeat() {
        const selectedDate = $('#datePicker').val();
        const selectedSession = $('#sessionSelect').val();
        const key = `${selectedDate}-${selectedSession}`;
        const selectedSeats = $('#seatsContainer .seat.selected').map(function() {
            return $(this).data('seat');
        }).get();

        if (selectedSeats.length > 0) {
            if (!reservations[key]) {
                reservations[key] = [];
            }
            reservations[key] = reservations[key].concat(selectedSeats);
            localStorage.setItem(storageKey, JSON.stringify(reservations));
            $('#message').text('Билеты успешно забронированы!');
            renderSeats();
        } else {
            $('#message').text('Пожалуйста, выберите хотя бы одно место.');
        }
    }

    $('#datePicker').on('change', function() {
        populateSessions();
        renderSeats();
    });

    $('#sessionSelect').on('change', function() {
        renderSeats();
    });

    $('#seatsContainer').on('click', '.seat:not(.reserved)', function() {
        $(this).toggleClass('selected');
    });

    $('#reserveButton').on('click', reserveSeat);

    populateDatePicker();
});
