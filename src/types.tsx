export interface User {
    "name": string;
    "email": string;
}

export interface Car {
    "Timestamp": string;
    "Make": string;
    "Model": string;
    "Color": string;
    "Features": string[];
    "Email": string;
    "Licence": string;
    "AlwaysAvailable": boolean;
    "Confirm": boolean;
    "Description": string;
    "Notes": string;
    "AvailableCalendar": string;
    "BookingCalendar": string;
}

export interface CarRequest {
    "threadId": string | null;
    "vehicle": string;
    "requester": string;
    "start": string;
    "end": string;
    "eventId": string | null;
    "confirmed": string | null;
    "features": string[];
}

export interface CarEvents {
    start: string;
    end: string;
    cars: string[];
    interval: number;
    busy_segments: string[];
}

export const Pages = {
    "/bookings": "Book Car",
    "/requests": "My Bookings",
    "/cars": "All Cars",
    "/calendar": "Calendar",
    "/my_car": "My Car"
}