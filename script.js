var selectedTimezone = 0; // default +0
var timezones = {
    min: -12,
    max: 14,
    odd_zones: [ -9.5, -3.5, 3.5, 4.5, 5.5, 5.75, 6.5, 8.5, 8.75, 9.5, 10.5, 12.75 ]
};

var timerElem = document.getElementById('timeblock');
var selectElem = document.getElementById('timezone-info');
var notifElem = document.getElementById('notif-check');

var nextMidnight;
var friendlyName = 'UTC';

function _genTimezoneElem(zone) {
    var elem = document.createElement('option');
    elem.setAttribute('tz', zone);
    elem.innerText = 'UTC';

    if (zone % 1 !== 0)
        var _zone = (''+zone)
            .replace('.5', ':30')
            .replace('.75', ':45');

    if (zone !== 0)
        elem.innerText += (((zone > 0) ? '+' : '') + (_zone || zone));

    return elem;
}

function populateSelectBox(select) {
    for (var i = timezones.min; i <= timezones.max; i++)
        select.appendChild(_genTimezoneElem(i));

    for (var i = 0; i < timezones.odd_zones.length; i++)
        select.appendChild(_genTimezoneElem(timezones.odd_zones[i]));

    select.value = 'UTC'; // default +0
}

function timezoneChange() {
    var optionSel = this.options[this.selectedIndex];
    selectedTimezone = optionSel.getAttribute('tz');
    friendlyName = optionSel.innerText;
    setNextMidnight();
    tick();
}

function setNextMidnight() {
    var d = new Date();

    var timezoneHour = parseInt(selectedTimezone);
    d.setUTCHours(24 - timezoneHour); // real difference

    // "odd" timezones compensation
    if (selectedTimezone % 1 === 0) // no decimal check
        d.setUTCMinutes(0);
    else
        d.setUTCMinutes((Math.abs(selectedTimezone) - Math.abs(timezoneHour)) * 60);

    d.setUTCSeconds(0);
    d.setUTCMilliseconds(0);

    if (d.getTime() < Date.now())
        d.setDate(d.getDate() + 1); // js accounts for next month etc
    else if ((d.getTime() - Date.now()) > 24 * 60 * 60 * 1000)
        d.setDate(d.getDate() - 1); // more than 24 hrs...

    nextMidnight = d.getTime();
}

function tick() {
    var diff = nextMidnight - Date.now();
    if (diff <= 0) {
        if (notifElem.checked)
            new Notification('Midnight Timer', {
                body: 'It is now midnight in (' + friendlyName + ' time).',
                image: './img/logo.png',
                icon: './img/favicon.ico',
                badge: './img/favicon.ico'
            });

        setNextMidnight();
        tick();
        return;
    }

    var hours = Math.floor(diff / 1000 / 60 / 60);
    var _hours = hours * 60 * 60 * 1000; // hours ms value
    var mins = Math.floor((diff - _hours) / 1000 / 60);
    var secs = Math.floor((diff - _hours - (mins * 60 * 1000)) / 1000);

    timerElem.innerText = hours + 'h ' + mins + 'm ' + secs + 's';
}

populateSelectBox(selectElem);
selectElem.addEventListener('change', timezoneChange);
setNextMidnight()
tick();
setInterval(tick, 500);

// extra notification stuff
if (Notification) {
    Notification.requestPermission().then(function(result) {
        if (result !== 'granted')
            return;

        document.getElementById('notif-wrap').style.display = '';
        notifElem.checked = true;
    });
}