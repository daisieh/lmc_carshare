import * as React from "react";
import moment from "moment";
import * as Transposit from "./fakeTranspositFunctions";
import {connect} from "react-redux";
import {Car, CarRequest, CarEvents, User} from "./types";

interface CarshareBookerProps {
    user: { name: string; email: string; };
    features: string[];
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
        // set the initial values for state:
    }

    render() {
        return (<div/>);
    }

    updateTimes(startTime: string, endTime: string) :[string, string]{
        let currentRequest = makeEmptyRequest(this.props.user);
        let newStart = moment(this.state.pendingRequest.start);
        let newEnd = moment(this.state.pendingRequest.end);

        // if both start and end are blank, we're resetting both
        if (startTime === "" && endTime === "") {
            newStart = moment().add(1, 'hour').startOf('hour');
            newEnd = moment().add(2, 'hour').startOf('hour');
        }
        console.log(`was ${newStart.format()} ${newEnd.format()}`);
        console.log(`asking for ${startTime} ${endTime}`);

        if (endTime !== "") {
            // we're setting the endTime,
            // so if the existing start is less than an hour before,
            // set the start to an hour before the end
            console.log(`comparing new end ${endTime} to ${newStart.format()}`);
            newEnd = moment(endTime);
            if (newStart.add(1, "hour").isAfter(newEnd)) {
                newStart = newEnd.clone().subtract(1, "hour");
                console.log(`...too soon, so set start to ${newStart}`);
            }
        } else if (startTime !== "") {
            // we're setting the startTime,
            // so if the existing end is less than an hour after,
            // set the end to an hour after the end
            console.log(`comparing new start ${startTime} to ${newEnd.format()}`);
            newStart = moment(startTime);
            if (newEnd.subtract(1, "hour").isBefore(newStart)) {
                newEnd = newStart.clone().add(1, "hour");
                console.log(`...too soon, so set end to ${newEnd}`);
            }
        }
        currentRequest.start = newStart.format();
        currentRequest.end = newEnd.format();
        this.setState({
            pendingRequest: currentRequest
        });
        console.log(`now ${currentRequest.start} ${currentRequest.end}`);
        return [currentRequest.start, currentRequest.end];
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
            bookedRequest: response.response,
            pendingRequest: makeEmptyRequest(this.props.user)
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
            cars: response.response
        });
    }

    async updateFeatures() {
        this.setState({isProcessing: true});
        await Transposit.listFeatures().then(
            response => {
                console.log("updateFeatures");
                console.log(response);
                this.setState({
                    isProcessing: false,
                    errorMessage: response.error,
                    // allFeatures: response.response
                });
            }
        );
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

function makeEmptyRequest(user: User) :CarRequest {
    return {
        start: moment().add(1, "hour").startOf("hour").format(),
        end: moment().add(2, "hour").startOf("hour").format(),
        threadId: null,
        eventId: null,
        vehicle: "",
        confirmed: null,
        requester: user.email,
        features: [] as string[]
    }
}

const mapStateToProps = (state) => {
    return {features: state.allFeatures.features};
}
export default connect(mapStateToProps)(CarshareBooker)
