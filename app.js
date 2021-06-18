const URL_BASE = "http://test.movilbox.co:888/test_mbox/test.php?metodo=";
let calendarEl = "";
let draggableUser ="";
let Draggable = "";

let menu = document.querySelector("#context-menu");
let menuItems = menu.querySelectorAll(".context-menu__item");
let menuState = 0;

var dataUser = [];
var dataPeriods = [];

const headers = {'Content-Type': 'application/json'};


document.addEventListener("DOMContentLoaded", function () {
    getDataUser();
    getdataPeriods();
    setTimeout(() => {
        InitCalendar();
        $(".fc-daygrid-day-events").click(function (e) {
            positionMenu(e);
        });

        $(document).click(function (e) {
            if (e.target.classList.contains('fc-event-title') === true) {
                toggleMenuOn();
            } else {
                toggleMenuOff();
            }
        });
    }, 1000);
})

/**
 * events -
 * @author Juan Jose
 */

document
  .querySelector("#buscador")
  .addEventListener("keyup", function (event) {
  event.preventDefault();
  let valueSearch = document.querySelector("#buscador").value;

  if (valueSearch.trim() != "") {
    let data = searchs(valueSearch);
    if (data.length === 0) {
      $("#usuarios").html("<div class='pl-3'>Data not found...</div>");
    } else {
      templeteUser(data);
    }
  } else {
    getUser();
  }
  });

document
    .querySelector("#save-programation")
    .addEventListener("click", function (event) {
        event.preventDefault();
        let data = getLocalStorage();

        if (data != undefined) {
            if(data.length > 0) {
                fetch(`${URL_BASE}guardar`, {
                    method: "POST",
                    body: data,
                })
                .then((data) => data.json())
                .then((res) => {
                    console.log(res);
                    if (res.state === 1) {
                        alert("se ha enviado los datos");
                        localStorage.removeItem("programation");
                        localStorage.setItem("programation", "[]");
                    }
                });
            } else {
                alert("No hay pramaciones para enviar....!")  
            }
        } else {
            alert("No hay pramaciones para enviar....!")
        }
  });



/**
 * function -
 * @author Juan Jose
 */

 function InitCalendar(){
    getUser();

    calendarEl = document.querySelector("#calendar");
    draggableUser = document.querySelector("#usuarios");

    Draggable = new FullCalendar.Draggable(draggableUser, {
        itemSelector: "#user",
        eventData: function (eventEl) {
            return {
                id: eventEl.getAttribute("data-name"),
                title: eventEl.innerText,
                color: getRandomColor()
            };
        },
    });

    calendar = new FullCalendar.Calendar(calendarEl, {
        locale: "es",
        timeZone: "UTC",
        initialView: "dayGridMonth",
        initialDate: "2020-06-01",

        //toolbar
        headerToolbar: {
            left: "prev,next",
            center: "title",
            right: "dayGridMonth",
        },

        // validacion de fechas
        validRange: {
            start: firstPositionDate().toString(),
            end: lastPositionDate().toString(),
        },

        // sizing
        height: 700,

        // date nav links
        navLinks: true,

        //
        fixedWeekCount: false,

        // date click and selecting
        selectable: true,
        selectMirror: true,

        // events popover
        dayMaxEventRows: true,
        views: {
            timeGrid: {
                dayMaxEventRows: 4, // adjust to 6 only for timeGridWeek/timeGridDay
            },
        },

        editable: true,
        dayMaxEvents: true,
        droppable: true,

        drop: function (event) {
            let id = event.draggedEl.attributes[2].value;
            let nombreProgramado = event.draggedEl.attributes[3].value;
            let idEventDropped = event.draggedEl.getAttribute("data-name");
            let fecha = event.dateStr;

            console.log(calendar.getEvents());

            if ((calendar.getEvents().filter(e => e.id === idEventDropped && e.startStr === fecha).length > 0) === true) {
                calendar.getEvents().filter(e => e.id === idEventDropped && e.startStr === fecha)[0].remove();
                alert('Este usuario ya se encuentra programado para este día !');
            } else {
                setLocalStorage(id, nombreProgramado, fecha, fecha);
            }
        },

        // confirm for move the event
        eventDrop: function (event) {
            if (!confirm("Estas seguro de cambiar la programación")) {
                event.revert();
            }
        },

    });

    calendar.render();
}

 function toggleMenuOn() {
    if (menuState !== 1) {
        menuState = 1;
        menu.classList.add("context-menu--active");
    }
}

function toggleMenuOff() {
    if (menuState !== 0) {
        menuState = 0;
        menu.classList.remove("context-menu--active");
    }
}

 function positionMenu(e) {

    clickCoords = getPosition(e);
    clickCoordsX = clickCoords.x;
    clickCoordsY = clickCoords.y;
    menuWidth = menu.offsetWidth + 4;
    menuHeight = menu.offsetHeight + 4;

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    if ((windowWidth - clickCoordsX) < menuWidth) {
        menu.style.left = windowWidth - menuWidth + "px";
    } else {
        menu.style.left = clickCoordsX + "px";
    }

    if ((windowHeight - clickCoordsY) < menuHeight) {
        menu.style.top = windowHeight - menuHeight + "px";
    } else {
        menu.style.top = clickCoordsY + "px";
    }
}

function getPosition(e) {
    var posx = 0;
    var posy = 0;

    if (!e) var e = window.event;

    if (e.pageX || e.pageY) {
        posx = e.pageX;
        posy = e.pageY;
    } else if (e.clientX || e.clientY) {
        posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    return {
        x: posx,
        y: posy
    }
}

// returns the info users
function getDataUser() {

  fetch(`${URL_BASE}usuarios`, headers)
        .then((resp) => resp.json())
        .then((data) => (this.dataUser = data))
        .catch((error) => console.log(error));
}

// returns the periods
function getdataPeriods() {
  fetch(`${URL_BASE}periodos`, headers)
        .then((resp) => resp.json())
        .then((data) => (this.dataPeriods = data))
        .catch((error) => console.log(error));
}

// genarete a random color
function getRandomColor() {
    let r = Math.floor(Math.random() * 256);
    let g = Math.floor(Math.random() * 256);
    let b = Math.floor(Math.random() * 256);
    let color = `rgb(${r}, ${g}, ${b})`;
    return color;
}

// return a currentDate
function getCurrentDate() {
    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();

  if (day < 10) {
    day = `0${day}`;
  }
  if (month < 10) {
    month = `0${month}`;
  }

  let currentDate = `${year}-${month}-${day}`;

  return currentDate;
}

// show users
function getUser() {
  templeteUser(this.dataUser);
}

// search of users
function searchs(valueSearch) {
  return this.dataUser.filter((user) =>
    user.nombre.toLowerCase().includes(valueSearch.toLowerCase())
  );
}

// template card the user
function templeteUser(response) {
  let templateHtmlUser = "";

  response.forEach(function (data, i, arr) {
    templateHtmlUser += `
        <div class="user-card" id="user" data-user="${data.idus}" data-name="${
      data.nombre
    }" draggable="true">
            <div class="user-info">
                <h4>${data.nombre}</h4>
                
                <p>${data.perfil}</p>
                <div>
                  <span>Dias planificados: </span><strong>${
                    data.dias_plani
                  }</strong>
                  <br/>
                  <span>Cant. Tiendas planificadas: </span><strong>${
                    data.tiendas_plani
                  }</strong>
                </div>
            </div>

            <div class="user-color" style="background-color: ${getRandomColor()}"></div>
        </div>
      `;
  });
  $("#usuarios").html(templateHtmlUser);
}

// date periods init
function firstPositionDate() {
    const last = this.dataPeriods.shift();
    let endDate = "" + last.anio + "-0" + last.mes + "-01";
    return endDate;
}

// date periods final
function lastPositionDate() {
    const last = this.dataPeriods.slice(-1);
    let endDate = "" + last[0].anio + "-" + last[0].mes + "-01";
    return endDate;
}

// localstorage
function setLocalStorage(id, title, fecha_init, fecha_end) {
    let old_data = [];

    if (localStorage.getItem("programation") == null) {
        localStorage.setItem("programation", "[]");
    }

    const object = {
        idus: id,
        fecha: fecha_init,
    };

    old_data = JSON.parse(localStorage.getItem("programation"));
    old_data.push(object);
    localStorage.setItem("programation", JSON.stringify(old_data));
}

function getLocalStorage() {
    const storage = localStorage;
    if (storage.getItem("programation") != null) {
        return JSON.parse(storage.getItem("programation"));
    }
}


