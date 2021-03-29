const URL_BASE = "http://test.movilbox.co:888/test_mbox/test.php?metodo=";
const calendar = document.querySelector("#calendar");
let draggableUser = document.querySelector("#usuarios");
var dataUser = [];
var dataPeriods = [];
var startDateAndEndDate = "";

getDataUser()
  .then((resp) => resp.json())
  .then((data) => (this.dataUser = data));

getdataPeriods()
  .then((resp) => resp.json())
  .then((data) => (this.dataPeriods = data));

document.addEventListener("DOMContentLoaded", function () {
  setTimeout(() => {
    eventDay();

    new FullCalendar.Draggable(draggableUser, {
      itemSelector: "#user",
      eventData: function (eventEl) {
        return {
          title: [
            eventEl.getAttribute("data-user"),
            eventEl.getAttribute("data-name"),
            this.startDateAndEndDate,
          ],
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

      // events - recive the events
      events: {
        // url: "",
        // success: function (response) {
        //   console.log(response);
        // },
        // failure: function (response) {
        //   console.warn(response);
        // },
        // eventDataTransform: function (event) {
        //   console.log(event);
        // },
        // color: getRandomColor(),
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

      eventOverlap: function (stillEvent, movingEvent) {
        return stillEvent.allDay && movingEvent.allDay;
      },

      eventClick: function (info) {},

      editable: true,
      droppable: true,
      eventResizableFromStart: true,
      drop: function (info) {
        // is the "remove after drop" checkbox checked?
        // alert("event drop");
      },

      eventReceive: function (info) {
        eventDay(info.event.startStr);
        // alert("event received! - eventReceive", info.event);
      },

      // confirm for move the event
      eventDrop: function (info) {
        alert(
          info.event.title + " was dropped on " + info.event.start.toISOString()
        );
        if (!confirm("Are you sure about this change?")) {
          info.revert();
        }
      },
    });

    calendarLib.render();
    getUser();
  }, 3000);
});

/**
 * events -
 * @author Juan Jose
 */

document.querySelector("#buscador").addEventListener("keyup", function (event) {
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
  .addEventListener("click", function () {
    document
      .querySelectorAll(
        ".fc-daygrid-day .fc-daygrid-day-frame .fc-daygrid-day-events .fc-daygrid-event-harness a .fc-event-main .fc-event-main-frame .fc-event-title-container .fc-event-title"
      )
      .forEach((element) => {
        console.log(this.startDateAndEndDate);
        console.log(element.innerText.split(","));
      });
  });

/**
 * function -
 * @author Juan Jose
 */

function eventDay(date) {
  return (this.startDateAndEndDate = date);
}

// returns the info users
function getDataUser() {
  let response = fetch(`${URL_BASE}usuarios`);
  return response;
}

// returns the periods
function getdataPeriods() {
  let response = fetch(`${URL_BASE}periodos`);
  return response;
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