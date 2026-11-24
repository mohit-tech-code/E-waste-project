
// =====================================
// ECOCYCLE - E-WASTE RECYCLING SYSTEM
// =====================================


// GET HTML ELEMENTS

const quantities = document.querySelectorAll(".quantity");

const totalPointsElement =
    document.getElementById("totalPoints");

const bookingForm =
    document.getElementById("bookingForm");

const confirmation =
    document.getElementById("confirmation");

const bookingDetails =
    document.getElementById("bookingDetails");

const bookingHistory =
    document.getElementById("bookingHistory");

const pickupDate =
    document.getElementById("pickupDate");


// SET MINIMUM PICKUP DATE TO TODAY

const today = new Date();

const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60000
).toISOString().split("T")[0];

pickupDate.min = localToday;


// =====================================
// 1. ECO REWARD POINTS CALCULATOR
// =====================================

function calculatePoints() {

    let totalPoints = 0;

    quantities.forEach(function(input) {

        let quantity = Math.max(
            0,
            parseInt(input.value) || 0
        );

        const points =
            parseInt(input.dataset.points);

        totalPoints += quantity * points;

    });

    totalPointsElement.textContent =
        totalPoints + " Points";

    return totalPoints;
}


// UPDATE POINTS WHEN QUANTITY CHANGES

quantities.forEach(function(input) {

    input.addEventListener("input", function() {

        if (Number(input.value) < 0) {
            input.value = 0;
        }

        calculatePoints();

    });

});


// =====================================
// 2. GET SELECTED E-WASTE ITEMS
// =====================================

function getSelectedItems() {

    const itemNames = [
        "Old Smartphones",
        "Laptops",
        "Keyboards / Mice",
        "Power Banks",
        "Cables"
    ];

    let selectedItems = [];

    quantities.forEach(function(input, index) {

        const quantity = Math.max(
            0,
            parseInt(input.value) || 0
        );

        if (quantity > 0) {

            selectedItems.push({
                name: itemNames[index],
                quantity: quantity
            });

        }

    });

    return selectedItems;
}


// =====================================
// 3. LOAD SAVED BOOKINGS
// =====================================

function getBookings() {

    try {

        const savedBookings =
            localStorage.getItem("ecoBookings");

        return savedBookings
            ? JSON.parse(savedBookings)
            : [];

    } catch (error) {

        console.error("Unable to read bookings:", error);

        return [];

    }

}


// =====================================
// 4. BOOKING FORM SUBMISSION
// =====================================

bookingForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const name =
        document.getElementById("customerName").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    const address =
        document.getElementById("address").value.trim();

    const date = pickupDate.value;

    const selectedItems = getSelectedItems();

    const points = calculatePoints();


    // CHECK IF AT LEAST ONE ITEM IS SELECTED

    if (selectedItems.length === 0) {

        alert("Please select at least one e-waste item.");

        return;

    }


    // CHECK CUSTOMER NAME

    if (name.length < 2) {

        alert("Please enter a valid customer name.");

        return;

    }


    // CHECK MOBILE NUMBER

    if (!/^[6-9][0-9]{9}$/.test(contact)) {

        alert("Please enter a valid 10-digit Indian mobile number.");

        return;

    }


    // CHECK ADDRESS

    if (address.length < 10) {

        alert("Please enter a complete pickup address.");

        return;

    }


    // CHECK PICKUP DATE

    if (!date || date < localToday) {

        alert("Please select today or a future pickup date.");

        return;

    }


    // CREATE BOOKING OBJECT

    const booking = {

        id: "ECO" + Date.now(),

        name: name,

        contact: contact,

        address: address,

        date: date,

        items: selectedItems,

        points: points,

        status: "Pickup Requested"

    };


    // SAVE BOOKING IN LOCAL STORAGE

    const bookings = getBookings();

    bookings.push(booking);

    try {

        localStorage.setItem(
            "ecoBookings",
            JSON.stringify(bookings)
        );

    } catch (error) {

        alert("Unable to save booking in browser storage.");

        return;

    }


    // DISPLAY SUCCESS MESSAGE

    showConfirmation(booking);

    displayBookings();

});


// =====================================
// 5. SHOW BOOKING CONFIRMATION
// =====================================

function showConfirmation(booking) {

    bookingForm.classList.add("hidden");

    confirmation.classList.remove("hidden");


    const itemText = booking.items.map(function(item) {

        return `${item.name} (${item.quantity})`;

    }).join(", ");


    bookingDetails.innerHTML = `

        <strong>Booking ID:</strong>
        ${booking.id}<br>

        <strong>Customer:</strong>
        ${escapeHTML(booking.name)}<br>

        <strong>Contact:</strong>
        ${escapeHTML(booking.contact)}<br>

        <strong>Pickup Address:</strong>
        ${escapeHTML(booking.address)}<br>

        <strong>Pickup Date:</strong>
        ${booking.date}<br>

        <strong>Items:</strong>
        ${escapeHTML(itemText)}<br>

        <strong>Eco Reward:</strong>
        🌱 ${booking.points} Points<br>

        <strong>Status:</strong>
        ${booking.status}

    `;

}


// Escape user input before displaying it as HTML.

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, function(character) {

        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];

    });

}


// =====================================
// 6. RESET FORM FOR NEW BOOKING
// =====================================

function newBooking() {

    bookingForm.reset();

    quantities.forEach(function(input) {

        input.value = 0;

    });

    calculatePoints();

    confirmation.classList.add("hidden");

    bookingForm.classList.remove("hidden");

    window.location.hash = "booking";

}


// =====================================
// 7. DISPLAY BOOKING HISTORY
// =====================================

function displayBookings() {

    const bookings = getBookings();

    if (bookings.length === 0) {

        bookingHistory.innerHTML = `

            <p class="empty-message">
                No bookings yet. Start recycling today!
            </p>

        `;

        return;

    }


    bookingHistory.innerHTML = bookings
        .slice()
        .reverse()
        .map(function(booking) {

            const items = booking.items.map(function(item) {

                return `${item.name} (${item.quantity})`;

            }).join(", ");

            return `

                <div class="history-card">

                    <h3>♻ ${booking.id}</h3>

                    <p>
                        <strong>Customer:</strong>
                        ${escapeHTML(booking.name)}
                    </p>

                    <p>
                        <strong>Pickup Date:</strong>
                        ${booking.date}
                    </p>

                    <p>
                        <strong>Items:</strong>
                        ${escapeHTML(items)}
                    </p>

                    <p>
                        <strong>Reward:</strong>
                        ${booking.points} Points
                    </p>

                    <p>
                        <strong>Status:</strong>
                        ${booking.status}
                    </p>

                </div>

            `;

        }).join("");

}


// =====================================
// 8. HAZARDOUS WASTE ACCORDION
// =====================================

const accordionHeaders =
    document.querySelectorAll(".accordion-header");

accordionHeaders.forEach(function(header) {

    header.addEventListener("click", function() {

        const currentItem =
            header.parentElement;

        const isActive =
            currentItem.classList.contains("active");


        // CLOSE ALL ACCORDION ITEMS

        document.querySelectorAll(".accordion-item")
            .forEach(function(item) {

                item.classList.remove("active");

                item.querySelector("span").textContent = "+";

            });


        // OPEN SELECTED ITEM

        if (!isActive) {

            currentItem.classList.add("active");

            header.querySelector("span").textContent = "−";

        }

    });

});


// =====================================
// 9. INITIALIZE APPLICATION
// =====================================

calculatePoints();

displayBookings();

