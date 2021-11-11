var CLIENT_ID =
  "26251038617-vv6veofnasd8iep666te8uh103nu7bav.apps.googleusercontent.com";
var API_KEY = "AIzaSyCcXSPJ-FZESsg9ak88p2Q6ZlncgJY64FM";

var SCOPES = "https://www.googleapis.com/auth/calendar.events";

var DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest",
];

var authorizeButton = document.getElementById("authorize_button");
var signoutButton = document.getElementById("signout_button");
//var addEventButton = document.getElementById("addEvent_button");

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: API_KEY,
      clientId: CLIENT_ID,
      discoveryDocs: DISCOVERY_DOCS,
      scope: SCOPES,
    })
    .then(
      function () {
        // Listen for sign-in state changes.
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

        // Handle the initial sign-in state.
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        appendPre(JSON.stringify(error, null, 2));
      }
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "none";
    //listUpcomingEvents();
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
const pre = document.getElementById("content");
const pre2 = document.getElementById("content2");
function appendPre(message) {
  var textContent = document.createTextNode(message + "\n");
  pre.appendChild(textContent);
}

const zone = "Europe/Zurich";
const loc = "Restaurant, 3000 Bern";
function dateAndTime(date, time) {
  var result = date + "T" + time + ":00+01:00";
  return result;
}
function reservation() {
  var firstName = document.getElementById("firstName").value;
  var lastName = document.getElementById("lastName").value;
  var guestNumber = document.getElementById("guestNumber").value;
  var phoneNumber = document.getElementById("phoneNumber").value;
  var reservationDate = document.getElementById("reservationDate").value;
  var reservationTime = document.getElementById("reservationTime").value;
  var info = document.getElementById("description").value;

  var event = {
    summary: firstName + " " + lastName + " " + phoneNumber,
    location: loc,
    description: info,
    start: {
      dateTime: dateAndTime(reservationDate, reservationTime),
      timeZone: zone,
    },
    end: {
      dateTime: dateAndTime(reservationDate, reservationTime),
      timeZone: zone,
    },
  };

  var request = gapi.client.calendar.events.insert({
    calendarId: "primary",
    resource: event,
  });

  request.execute(function (event) {
    //appendPre("Event created: " + event.htmlLink);
  });
  console.log(
    firstName +
      "\n" +
      lastName +
      "\n" +
      guestNumber +
      "\n" +
      phoneNumber +
      "\n" +
      reservationDate +
      "\n" +
      reservationTime +
      "\n" +
      dateAndTime(reservationDate, reservationTime) +
      "\n" +
      "2021-11-05T15:00:00-07:00"
  );
}

function listUpcomingEvents() {
  var checkPhoneNumber = document.getElementById("cancelPhone").value;

  gapi.client.calendar.events
    .list({
      calendarId: "primary",
      timeMin: new Date().toISOString(),
      showDeleted: false,
      singleEvents: true,
      maxResults: 10,
      orderBy: "startTime",
    })
    .then(function (response) {
      var events = checkNumber(response.result.items, checkPhoneNumber);
      appendPre("Upcoming events:");
      console.log(events);
      if (events.length > 0) {
        for (i = 0; i < events.length; i++) {
          var event = events[i];
          var when = event.start.dateTime;
          if (!when) {
            when = event.start.date;
          }
          var cancelButton = document.createElement("button");
          cancelButton.id = event.id;
          cancelButton.classList.add("cancellation");
          cancelButton.textContent = "Cancel";
          pre.appendChild(cancelButton);
          appendPre(event.summary + " (" + when + ")");
        }
        var btn = document.querySelectorAll(".cancellation");
        console.log(btn);

        btn.forEach((button) =>
          button.addEventListener("click", () => {
            console.log(button.id);
            gapi.client.calendar.events
              .delete({
                calendarId: "primary",
                eventId: button.id,
              })
              .then(
                function (response) {
                  // Handle the results here (response.result has the parsed body).
                  console.log("Response", response);
                },
                function (err) {
                  console.error("Execute error", err);
                }
              );
          })
        );
      } else {
        appendPre("No upcoming events found.");
      }
    });
}

function checkNumber(events, telNumber) {
  var list = [];
  console.log(events);
  if (events.length > 0) {
    for (i = 0; i < events.length; i++) {
      console.log(i + " " + events[i].summary);
      console.log(events[i].summary.includes(telNumber));
      if (
        events[i].summary.includes(telNumber) == true &&
        events[i].summary != null
      ) {
        list.push(events[i]);
      }
    }

    return list;
  }
}

const checkList = document.getElementById("checkList");
const checkEventList = document.getElementById("checkEventList");

var addEventClass = document.querySelector(".addEventForm");
var checklistClass = document.querySelector(".checkListForm");

checkEventList.addEventListener("click", () => {
  addEventClass.style.display = "none";

  checklistClass.style.display = "block";
  checkEventList.style.display = "none";
  signoutButton.style.display = "none";
});

checkList.addEventListener("click", listUpcomingEvents);

const reservationPage = document.getElementById("reservationPage");
reservationPage.addEventListener("click", () => {
  checklistClass.style.display = "none";
  addEventClass.style.display = "block";
  pre.textContent = "";
});
