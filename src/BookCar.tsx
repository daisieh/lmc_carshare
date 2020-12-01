import * as React from "react";
import moment from "moment";
import {Modal, Radio, TagPicker} from "rsuite";
import Button from 'react-bootstrap/Button';
import Spinner from 'react-bootstrap/Spinner';
import {DateTimePicker} from "react-widgets";
import {Car, CarRequest, User} from "./types";
import {connect} from "react-redux";
import {clearAvailable, loadAvailableCars} from "./redux/reducers/carSlice";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {createRequest, resetNewest} from "./redux/reducers/requestSlice";

interface BookCarProps {
    user: User;
    features: string[];
    cars: Car[];
    available: Car[];
    carStatus: string;
    requestStatus: string;
    featureStatus: string;
    carError: string;
    requestError: string;
    dispatch: ThunkDispatch<any, any, any>;
    bookedRequest: CarRequest | null;
}

interface BookCarState {
    pendingRequest: CarRequest;
    startDate: Date;
    endDate: Date;
}

export class BookCar extends React.Component<BookCarProps, BookCarState> {
    constructor(props) {
        super(props);
        let now = this.updateTimes("", "");
        this.state = {
            startDate: new Date(now[0]),
            endDate: new Date(now[1]),
            pendingRequest: makeEmptyRequest(this.props.user)
        }
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.onLookForCars = this.onLookForCars.bind(this);
        this.onTagPick = this.onTagPick.bind(this);
        this.onClickCarRadio = this.onClickCarRadio.bind(this);
        this.onReserveCar = this.onReserveCar.bind(this);
        this.resetPicker = this.resetPicker.bind(this);
        this.updateTimes = this.updateTimes.bind(this);
    }

    onClickCarRadio(value) {
        let req = this.state.pendingRequest;
        req.vehicle = value;
        this.setState({pendingRequest: req});
    }

    onReserveCar(event) {
        event.preventDefault();
        this.props.dispatch(createRequest(this.state.pendingRequest));
    }

    handleStartChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes(event.toString(), "");
        } else {
            updated = this.updateTimes("", "");
        }
        let pending = this.state.pendingRequest;
        pending.start = updated[0];
        pending.end = updated[1];

        this.setState({
            startDate: new Date(updated[0]),
            endDate: new Date(updated[1]),
            pendingRequest: pending
        });
    }

    handleEndChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes("", event.toString());
        } else {
            updated = this.updateTimes("", "");
        }
        let pending = this.state.pendingRequest;
        pending.start = updated[0];
        pending.end = updated[1];

        this.setState({
            startDate: new Date(updated[0]),
            endDate: new Date(updated[1]),
            pendingRequest: pending
        });
    }

    onLookForCars() {
        this.props.dispatch(loadAvailableCars(this.state.pendingRequest));
    }

    onTagPick(event) {
        console.log(`pick ${event.toString()}`);
        let req = this.state.pendingRequest;
        req.features = event as string[];
        this.setState({pendingRequest: req});
    }

    updateTimes(startTime: string, endTime: string) :[string, string]{
        let newEnd, newStart;

        // if both start and end are blank, we're resetting both
        if (startTime === "" && endTime === "") {
            newStart = moment().add(1, 'hour').startOf('hour');
            newEnd = moment().add(2, 'hour').startOf('hour');
        } else {
            newStart = moment(this.state.startDate);
            newEnd = moment(this.state.endDate);
        }

        if (endTime !== "") {
            // we're setting the endTime,
            // so if the existing start is less than an hour before,
            // set the start to an hour before the end
            newEnd = moment(endTime);
            // if (newStart.add(1, "hour").isAfter(newEnd)) {
            //     newStart = newEnd.clone().subtract(1, "hour");
            //     console.log(`...too soon, so set start to ${newStart}`);
            // }
        } else if (startTime !== "") {
            // we're setting the startTime,
            // so if the existing end is less than an hour after,
            // set the end to an hour after the end
            newStart = moment(startTime);
            // if (newEnd.subtract(1, "hour").isBefore(newStart)) {
            //     newEnd = newStart.clone().add(1, "hour");
            //     console.log(`...too soon, so set end to ${newEnd}`);
            // }
        }
        return [newStart.format(), newEnd.format()];
    }

    bookCar() {
        this.props.dispatch(createRequest(this.state.pendingRequest));
        this.setState({
            pendingRequest: makeEmptyRequest(this.props.user)
        });
    }

    resetPicker() {
        this.props.dispatch(resetNewest({}));
        this.props.dispatch(clearAvailable({}));
        let times = this.updateTimes("", "");
        this.setState({
            startDate: new Date(times[0]),
            endDate: new Date(times[1]),
            pendingRequest: makeEmptyRequest(this.props.user)
        });
    }

    render() {
        if (this.props.featureStatus === "loading") {
            return (
                <div>
                    <Spinner className="main-spinner" animation="border" role="status"/>
                </div>
            )
        }
        let times = this.updateTimes("", "");
        let disabled = (this.props.available !== null) || (this.props.carStatus === "loading");
        let inThePast = "";
        if (moment(this.state.startDate).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = this.props.features.map(x => { return {"value": x, "label": x}; });
        let search_form = (
            <div className="search-form">
                <p className={disabled?"caption-disabled":"caption"}>Select the date and time you'd like to book.</p>
                <div className="date-select">
                    <DateTimePicker
                        format="YYYY-MM-DD HH:mm"
                        timeFormat={"HH:mm"}
                        onChange={this.handleStartChange}
                        value={this.state.startDate}
                        min={new Date(times[0])}
                        disabled={disabled}
                        step={15}
                    />
                    <DateTimePicker
                        className="selector"
                        format="YYYY-MM-DD HH:mm"
                        timeFormat={"HH:mm"}
                        onChange={this.handleEndChange}
                        value={this.state.endDate}
                        min={this.state.startDate}
                        disabled={disabled}
                        step={15}
                    />
                </div>
                <p className={disabled?"caption-disabled":"caption"}>Only select cars with all of these features:</p>
                <div className="feature-select">
                    <TagPicker
                        className="selector"
                        size="sm"
                        style={{width: 300}}
                        data={feat_array}
                        value={this.state.pendingRequest.features}
                        onChange={this.onTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    className="selector"
                    size="sm"
                    onClick={this.onLookForCars}
                    disabled={disabled}
                >
                    Look for cars
                </Button>
                <div className="error">{[inThePast,this.props.requestError,this.props.carError].join("\n")}</div>
            </div>
        );

        let available_cars = <div className="available-form"/>;

        if (this.props.available && this.props.carStatus !== "loading") {
            available_cars = (
                <div className="available-form">
                    No cars available at this time
                </div>
            );
            let chosenCar = null as Car | null;
            let email = "";
            if (this.props.available.length > 0) {
                chosenCar = this.props.cars.filter(car => {
                    return (car.Licence === this.state.pendingRequest.vehicle);
                })[0];
                if (chosenCar != null) {
                    email = chosenCar.Email;
                }
                console.log(`there are ${this.props.available.length} cars, chosen car is ${email}`);
                let rows = this.props.available.map((car) => {
                    let isChosenCar = (email === car.Email);
                    let needsConfirm = car.Confirm ? "(requires approval)" : "";
                    return (
                        <Radio checked={isChosenCar} onChange={this.onClickCarRadio} value={car.Licence}
                               key={car.Licence}>
                            {car.Description} {needsConfirm}
                        </Radio>
                    )
                });
                available_cars = (
                    <div className="available-form">
                        <p>Cars available for booking:</p>
                        {rows}
                        <br/>
                        <Button
                            size="sm"
                            onClick={this.onReserveCar}
                            disabled={chosenCar == null}
                            // loading={this.props.requestStatus === "loading"}
                        >
                            Book it!
                        </Button>
                    </div>
                );
            }
        }
        let message = "";
        let bookedReq = this.props.bookedRequest;
        if (bookedReq) {
            if (bookedReq.confirmed) {
                message = "Check your calendar for a confirmation of your booking!";
            } else {
                message = "The car's owner has been notified. You will receive an email if they have approved your request.";
            }
        }
        let booking_status = (
            <div className="modal-container">
                <Modal show={message !== ""} onHide={() => {this.resetPicker();}}>
                    <Modal.Header>
                        <Modal.Title>Booking request sent!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => {this.resetPicker();}}>
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

                return (
                <div>
                    <div>
                        {search_form}
                        {available_cars}
                        {booking_status}
                    </div>
                    <div>
                    <Button
                        className="reset-button"
                        size="sm"
                        onClick={this.resetPicker}
                    >
                        Reset form
                    </Button>
                    </div>
                </div>
                );
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
    return {
        user: state.user.user,
        features: state.allFeatures.entries,
        cars: state.cars.entries,
        available: state.cars.available,
        carStatus: state.cars.status,
        requestStatus: state.requests.status,
        featureStatus: state.allFeatures.status,
        carError: state.cars.error,
        requestError: state.requests.error,
        bookedRequest: state.requests.newest
    };
}
export default connect(mapStateToProps)(BookCar)
