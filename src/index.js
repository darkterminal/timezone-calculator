const data = require('./data/timezone-db.json');
const TIMEZONE_LISTS = require('./data/timezone.js');

/**
 *
 * @param {string} value timezone like Asia/Jakarta
 * @param {string} key availables: UTC, TimeZone, MDT
 * @returns {object}
 */
function getTimezoneObject(value, key = "TimeZone") {
    for (let i = 0; i < data.length; i++) {
        if (data[i][key] === value) {
            return data[i];
        }
    }
    return null;
}

function calculateUTCTimeDifference(from, to) {
    // Extract the numeric offset values from the input strings
    const fromOffset = parseInt(from.replace("UTC", ""), 10);
    const toOffset = parseInt(to.replace("UTC", ""), 10);

    // Calculate the UTC time difference
    const utcDifference = fromOffset - toOffset;

    return utcDifference;
}

function convertToPacificTime(dateTimeString) {
    // Parse the input date and time string
    const date = new Date(dateTimeString);

    // Get the UTC time in milliseconds
    const utcTime = date.getTime();

    // Calculate the Pacific Time offset in milliseconds (GMT-7)
    const pacificOffset = -7 * 60 * 60 * 1000;

    // Calculate the Pacific Time by applying the offset
    const pacificTime = new Date(utcTime + pacificOffset);

    // Format the Pacific Time
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        timeZone: 'America/Los_Angeles',
        timeZoneName: 'short'
    };

    const pacificTimeString = pacificTime.toLocaleString('en-US', options);
    return pacificTimeString;
}

function convertToPST(dateTimeString) {
    // Parse the input date and time string
    const date = new Date(dateTimeString);

    // Convert to PST (America/Los_Angeles timezone)
    const pstOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZone: "America/Los_Angeles",
        timeZoneName: "short",
    };
    const pstDateTimeString = date.toLocaleString("en-US", pstOptions);

    return pstDateTimeString;
}

/**
 * Convert a date from one timezone to another.
 * @param {import('./data/timezone.js').TimeZoneList} from - The origin timezone to convert.
 * @param {import('./data/timezone.js').TimeZoneList} to - The target timezone to convert.
 * @returns {object} - The converted date object.
 */
function convertTime(from, to) {
    if (!TIMEZONE_LISTS.includes(from) || !TIMEZONE_LISTS.includes(to)) {
        console.error("Timezone is not supported")
        return null
    }
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
        hour12: false,
        hourCycle: 'h23'
    };

    const timeFrom = new Date().toLocaleString('en-US', {
        ...options,
        timeZone: from
    });
    const timeTo = new Date().toLocaleString('en-US', {
        ...options,
        timeZone: to
    });

    const diffInUTC = calculateUTCTimeDifference(getTimezoneObject(from).UTC, getTimezoneObject(to).UTC)
    const pt_in_origin = convertToPacificTime(timeFrom)
    const pt_in_target = convertToPacificTime(timeTo)
    const pst_in_origin = convertToPST(timeFrom)
    const pst_in_target = convertToPST(timeTo)
    const diff_origin_target = `${diffInUTC} hours`

    return {
        origin: {
            timezone: from,
            date_time: timeFrom,
            pacific_time: pt_in_origin,
            pacific_standar_time: pst_in_origin
        },
        target: {
            timezone: from,
            date_time: timeFrom,
            pacific_time: pt_in_target,
            pacific_standar_time: pst_in_target
        },
        diff: {
            origin_target: diff_origin_target
        }
    };
}

module.exports = { convertTime }
