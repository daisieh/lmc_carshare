import {makeEmptyRequest} from "./CarshareBooker";
import * as React from "react";
import moment from "moment";
import {Button, DatePicker, Modal, Radio, TagPicker} from "rsuite";
import {Car, CarRequest, User} from "./types";
import {connect} from "react-redux";
import * as Transposit from "./fakeTranspositFunctions";

interface SearchAvailabilityProps {
    user: User;
    features: string[];
    cars: Car[];
    status: string;
    error: string;
}

interface SearchAvailabilityState {
    pendingRequest: CarRequest;
    bookedRequest: CarRequest | null;
    startDate: Date;
    endDate: Date;
    availableCars: Car[];
}

export class BookCar extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(),
            endDate: new Date(),
            pendingRequest: makeEmptyRequest(this.props.user),
            bookedRequest: null,
            availableCars: [] as Car[]
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
        // this.props.booker.bookCar();
    }

    handleStartChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes(event.toString(), "");
        } else {
            updated = this.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    handleEndChange(event) {
        let updated;
        if (event) {
            updated = this.updateTimes("", event.toString());
        } else {
            updated = this.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    onLookForCars() {
        // this.props.booker.getAvailableCars();
    }

    onTagPick(event) {
        console.log(`pick ${event.toString()}`);
        let req = this.state.pendingRequest;
        req.features = event as string[];
        this.setState({pendingRequest: req});
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

    bookCar() {
        let response = Transposit.createBooking(this.state.pendingRequest);
        this.setState({
            bookedRequest: response.response,
            pendingRequest: makeEmptyRequest(this.props.user)
        });
        this.resetPicker();
    }

    resetPicker() {
        this.setState({
            pendingRequest: makeEmptyRequest(this.props.user),
            bookedRequest: null,
            availableCars: [] as Car[]
        });
    }

    render() {
        let disabled = false;//(booker.state.availableCars && booker.state.availableCars.length > 0) || (booker.state.pendingRequest !== null);
        let inThePast = "";
        if (moment(this.state.pendingRequest.start).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = this.props.features.map(x => { return {"value": x, "label": x}; });
        let search_form = (
            <div className="search-form">
                <p className={disabled?"caption-disabled":"caption"}>Select the date and time you'd like to book.</p>
                <div className="date-select">
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleStartChange}
                        value={this.state.startDate}
                        disabled={disabled}
                    />
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleEndChange}
                        value={this.state.endDate}
                        disabled={disabled}
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
                    appearance="ghost"
                    className="selector"
                    loading={false}
                    size="sm"
                    onClick={this.onLookForCars}
                    disabled={disabled}
                >
                    Look for cars
                </Button>
                <div className="error">{inThePast}</div>
            </div>
        );

        let available_cars = (
            <div className="available-form">
                No cars available at this time
            </div>
        );
        let chosenCar = null as Car | null;
        let email = "";
        if (this.state.availableCars.length > 0) {
            chosenCar = this.props.cars.filter(car => {
                return (car.Licence === this.state.pendingRequest.vehicle);
            })[0];
            if (chosenCar != null) {
                email = chosenCar.Email;
            }
            console.log(`there are ${this.state.availableCars.length} cars, chosen car is ${email}`);
            let rows = this.state.availableCars.map((car) => {
                let isChosenCar = (email === car.Email);
                let needsConfirm = car.Confirm ? "(requires approval)" : "";
                return (
                    <Radio checked={isChosenCar} onChange={this.onClickCarRadio} value={car.Email}>
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
                        appearance="ghost"
                        size="sm"
                        onClick={this.onReserveCar}
                        disabled={chosenCar == null}
                        loading={this.props.status === "processing"}
                    >
                        Book it!
                    </Button>
                </div>
            );
        }

        let message = "";
        let bookedReq = this.state.bookedRequest;
        if (bookedReq) {
            console.log(bookedReq);
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
                        <Button onClick={() => {this.resetPicker();}} appearance="primary">
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );

        return (
            <div>
                {search_form}
                {available_cars}
                {booking_status}
            </div>);
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        features: state.allFeatures.entries,
        cars: state.cars.entries,
        status: state.cars.status,
        error: state.cars.error};
}
export default connect(mapStateToProps)(BookCar)
