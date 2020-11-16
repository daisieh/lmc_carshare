import * as React from "react";
import moment from "moment";
import * as Transposit from "./transpositFunctions";

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

interface CarshareBookerProps {
    user: { name: string; email: string; };
}

interface CarshareBookerState {
    user: { name: string; email: string; };
    cars: Car[];
    pendingRequest: CarRequest;
    bookedRequest: CarRequest | null;
    availableCars: Car[] | null;
    requests: CarRequest[];
    allFeatures: string[];
    isProcessing: boolean;
    errorMessage: string;
}

export class CarshareBooker extends React.Component<CarshareBookerProps, CarshareBookerState> {
    constructor(props) {
        super(props);
        this.state = {
            cars: [] as Car[],
            user: this.props.user,
            allFeatures: [] as string[],
            requests: [] as CarRequest[],
            pendingRequest: makeEmptyRequest(this.props.user),
            bookedRequest: null,
            availableCars: null,
            errorMessage: "",
            isProcessing: false
        };
        this.getAvailableCars = this.getAvailableCars.bind(this);
        this.updateTimes = this.updateTimes.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.updateRequests = this.updateRequests.bind(this);
        this.updateAllCars = this.updateAllCars.bind(this);
        this.updateFeatures = this.updateFeatures.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
        this.resetPicker = this.resetPicker.bind(this);
        this.deleteRequests = this.deleteRequests.bind(this);
        this.sendReminderForRequest = this.sendReminderForRequest.bind(this);
    }

    updateTimes(startTime: string, endTime: string) {
        let start = moment().add(1, 'hour').startOf('hour');
        let end = start.clone().add(1, 'hour');
        let currentRequest = makeEmptyRequest(this.props.user);
        if (startTime === "" && endTime === "") {
            console.log(`reset to ${start.format()} and ${end.format()}`);
            currentRequest.start = start.format();
            currentRequest.end = end.format();
            this.setState({
                pendingRequest: currentRequest
            });
            return;
        } else if (endTime !== "") {
            end = moment(endTime);
            // set start to at least an hour before
            if (start.add(1, "hour").isAfter(end)) {
                currentRequest.start = end.clone().subtract(1, "hour").format();
            }
        } else if (startTime !== "") {
            start = moment(startTime);
            // set end to at least an hour after
            if (end.subtract(1, "hour").isBefore(start)) {
                currentRequest.end = start.clone().add(1, "hour").format();
            }
        }
        this.setState({
            pendingRequest: currentRequest
        });
    }

    resetPicker() {
        this.setState({
            pendingRequest: makeEmptyRequest(this.props.user),
            bookedRequest: null,
            availableCars: null
        });
    }

    getChosenCar(): Car | null {
        let cars = this.state.cars.filter(car => {
            return (car.Licence === this.state.pendingRequest.vehicle);
        });
        if (cars.length > 0) {
            return cars[0];
        }
        return null;
    }

    getAvailableCars() {
        this.setState({isProcessing: true});
        let response = Transposit.getAvailableCars(this.state.pendingRequest);
        this.setState({
            availableCars: response.response,
            errorMessage: response.error,
            pendingRequest: makeEmptyRequest(this.props.user),
            isProcessing: false
        });
    }

    deleteRequests(eventIds: string[]) {
        this.setState({isProcessing: true});
        let response = Transposit.deleteRequests(eventIds);
        this.setState({
            isProcessing: false,
            errorMessage: response.error
        });
    }

    sendReminderForRequest(eventId: string) {
        this.setState({isProcessing: true});
        let response = Transposit.sendReminderToOwner(eventId);
        this.setState({
            isProcessing: false,
            errorMessage: response.error
        });
    }

    bookCar() {
        this.setState({isProcessing: true});
        let response = Transposit.createBooking(this.state.pendingRequest);
        this.setState({
            isProcessing: false,
            errorMessage: response.error,
            bookedRequest: response.response
        });
        this.resetPicker();
    }

    updateRequests() {
        this.setState({isProcessing: true});
        let response = Transposit.listRequests(this.props.user);
        this.setState({
            isProcessing: false,
            errorMessage: response.error,
            requests: response.response
        });
    }

    updateAllCars() {
        this.setState({isProcessing: true});
        let response = Transposit.listAllCars();
        this.setState({
            isProcessing: false,
            errorMessage: response.error,
            requests: response.response
        });
    }

    updateFeatures() {
        this.setState({isProcessing: true});
        let response = Transposit.listFeatures();
        this.setState({
            isProcessing: false,
            errorMessage: response.error,
            requests: response.response
        });
    }

    getThreeDays() :CarEvents {
        this.setState({isProcessing: true});
        let response = Transposit.getThreeDaysEvents();
        this.setState({
            isProcessing: false,
            errorMessage: response.error
        });
        return response.response;
    }
}

export function makeEmptyRequest(user: User) :CarRequest {
    return {
        start: moment().format(),
        end: moment().add(1, "hour").format(),
        threadId: null,
        eventId: null,
        vehicle: "",
        confirmed: null,
        requester: user.email,
        features: [] as string[]
    }
}