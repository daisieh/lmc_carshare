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
        this.updateRequests = this.updateRequests.bind(this);
        this.updateAllCars = this.updateAllCars.bind(this);
        this.updateFeatures = this.updateFeatures.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
        this.deleteRequests = this.deleteRequests.bind(this);
        this.sendReminderForRequest = this.sendReminderForRequest.bind(this);
        // set the initial values for state:
    }

    render() {
        return (<div/>);
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
            // isProcessing: false,
            // errorMessage: response.error
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

    updateRequests() {
        this.setState({isProcessing: true});
        Transposit.listRequests().then(response => {
            this.setState({
                isProcessing: false,
                errorMessage: response.error,
                requests: response.response
            });
        });
    }

    updateAllCars() {
        this.setState({isProcessing: true});
        Transposit.listAllCars().then(response => {
            this.setState({
                isProcessing: false,
                errorMessage: response.error,
                cars: response.response
            });
        })
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

export function makeEmptyRequest(user: User) :CarRequest {
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
