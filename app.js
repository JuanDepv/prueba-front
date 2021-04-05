const URL_BASE = "http://test.movilbox.co:888/test_mbox/test.php?metodo=";
const calendar = document.querySelector("#calendar");
let draggableUser = document.querySelector("#usuarios");
var dataUser = [];
var dataPeriods = [];

const headers = {
  'Content-Type': 'application/json',
};

getDataUser();
getdataPeriods();

// getDataUser()
//   .then((resp) => resp.json())
//   .then((data) => (this.dataUser = data));

// getdataPeriods()
//   .then((resp) => resp.json())
//   .then((data) => (this.dataPeriods = data));

document.addEventListener("DOMContentLoaded", function () {
  
  setTimeout(() => {
    getUser();

    new FullCalendar.Draggable(draggableUser, {
      itemSelector: "#user",
      eventData: function (eventEl) {
        return {
          title: eventEl.getAttribute("data-name"),
        };
      },
    });

    const calendarLib = new FullCalendar.Calendar(calendar, {
      initialView: "dayGridMonth",
      themeSystem: "bootstrap",
      timeZone: "UTC",
      locale: "es",

      // date Navigation - initial perids and range Periods
      initialDate: "2020-06-01",
      validRange: {
        start: firstPositionDate().toString(),
        end: lastPositionDate().toString(),
      },
      headerToolbar: {
        left: "prev,next",
        center: "title",
        right: "dayGridMonth",
      },

      
      // test schedules - default
      events: {
        url: "events.json",
        success: function (response) {
        },
        failure: function (response) {
        },
        eventDataTransform: function (event) {
          
        },
      },

      //sizing
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
      // select: function (info) {
      //   // calendar.addEvent({
      //   //   title: title,
      //   //   start: arg.start,
      //   //   end: info.startStr,
      //   //   allDay: info.endStr,
      //   // });
      //   alert(info);
      //   alert("selected " + info.startStr + " to " + info.endStr);
      // },

      eventClick: function(info) {

        // alert('Event: ' + info.event.title);
        // alert('Coordinates: ' + info.jsEvent.pageX + ',' + info.jsEvent.pageY);
        // alert('View: ' + info.view.type);
      },

      eventOverlap: function (stillEvent, movingEvent) {
        return stillEvent.allDay && movingEvent.allDay;
      },

      editable: true,
      droppable: true,
      eventResizableFromStart: true,
      drop: function (info) {
        let id = info.draggedEl.attributes[2].value;
        let nombreProgramado = info.draggedEl.attributes[3].value;
        let fecha = info.dateStr;

        setLocalStorage(id, nombreProgramado, fecha, fecha);
      },

      eventReceive: function (info) {
        // eventDay(info.event.startStr);
        // alert("event received! - eventReceive", info.event);
      },

      // confirm for move the event
      eventDrop: function (info) {
        alert(
          info.event.title + " was dropped on " + info.event.start.toISOString()
        );
        if (!confirm("Are you sure about this change? Estas seguro de cambiar la programación")) {
          info.revert();
        }
      },
    });
    
    calendarLib.render();
    
  }, 2000);

});

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

    console.log(data);

    if (data.length > 0 || data) {
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
    }
  });



/**
 * function -
 * @author Juan Jose
 */

// returns the info users
function getDataUser() {
  // fetch(`${URL_BASE}usuarios`, headers);
  // return response;
  
  fetch(`${URL_BASE}usuarios`, headers)
    .then((resp) => resp.json())
    .then((data) => (this.dataUser = data))
    .catch((error) => console.log(error));
}

// returns the periods
function getdataPeriods() {
  // let response = fetch(`${URL_BASE}periodos`, headers);
  // return response;

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
