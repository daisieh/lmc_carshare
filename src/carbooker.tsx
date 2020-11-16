import * as React from "react";
import moment from "moment";
import {Button, DatePicker, Modal, Radio, TagPicker} from "rsuite";
import {CarshareBooker} from "./CarshareBooker";

interface SearchAvailabilityProps {
    booker: CarshareBooker;
}

interface SearchAvailabilityState {
    startDate: Date;
    endDate: Date;
}

export class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.state = {
            startDate: new Date(this.props.booker.state.pendingRequest.start),
            endDate: new Date(this.props.booker.state.pendingRequest.end)
        }
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.onLookForCars = this.onLookForCars.bind(this);
        this.onTagPick = this.onTagPick.bind(this);
    }

    handleStartChange(event) {
        let updated;
        if (event) {
            updated = this.props.booker.updateTimes(event.toString(), "");
        } else {
            updated = this.props.booker.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    handleEndChange(event) {
        let updated;
        if (event) {
            updated = this.props.booker.updateTimes("", event.toString());
        } else {
            updated = this.props.booker.updateTimes("", "");
        }
        this.setState({startDate: new Date(updated[0]), endDate: new Date(updated[1])});
    }

    onLookForCars() {
        this.props.booker.getAvailableCars();
    }

    onTagPick(event) {
        let req = this.props.booker.state.pendingRequest;
        req.features = event as string[];
        this.props.booker.setState({pendingRequest: req});
    }

    render() {
        let booker = this.props.booker;
        let disabled = false;//(booker.state.availableCars && booker.state.availableCars.length > 0) || (booker.state.pendingRequest !== null);
        let inThePast = "";
        if (moment(booker.state.pendingRequest.start).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = booker.state.allFeatures.map(x => { return {"value": x, "label": x}; });

        return (
            <div className="search-form">
                <p>{this.props.booker.state.pendingRequest.start} {this.props.booker.state.pendingRequest.end}</p>
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
                        value={booker.state.pendingRequest.features}
                        onChange={this.onTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    appearance="ghost"
                    className="selector"
                    loading={booker.state.isProcessing}
                    size="sm"
                    onClick={this.onLookForCars}
                    disabled={disabled}
                >
                    Look for cars
                </Button>
                <div className="error">{inThePast}</div>
            </div>
        );
    }
}

interface AvailableCarsProps {
    booker: CarshareBooker;
}

export class AvailableCars extends React.Component<AvailableCarsProps, {}> {
    constructor(props) {
        super(props);
        this.onClickCarRadio = this.onClickCarRadio.bind(this);
        this.onReserveCar = this.onReserveCar.bind(this);
    }

    onClickCarRadio(value) {
        let req = this.props.booker.state.pendingRequest;
        req.vehicle = value;
        this.props.booker.setState({pendingRequest: req});
    }

    onReserveCar(event) {
        event.preventDefault();
        this.props.booker.bookCar();
    }

    render() {
        let booker = this.props.booker;
        if (booker.state.availableCars) {
            let chosenCar = booker.getChosenCar();
            let email = "";
            if (chosenCar != null) {
                email = chosenCar.Email;
            }
            console.log(`there are ${booker.state.availableCars.length} cars, chosen car is ${email}`);
            if (booker.state.availableCars.length === 0) {
                return (
                    <div className="available-form">
                        No cars available at this time
                    </div>
                );
            }
            let rows = booker.state.availableCars.map((car) => {
                let isChosenCar = (email === car.Email);
                let needsConfirm = car.Confirm ? "(requires approval)" : "";
                return (
                    <Radio checked={isChosenCar} onChange={this.onClickCarRadio} value={car.Email}>
                        {car.Description} {needsConfirm}
                    </Radio>
                )
            });

            return (
                <div className="available-form">
                    <p>Cars available for booking:</p>
                    {rows}
                    <br/>
                    <Button
                        appearance="ghost"
                        size="sm"
                        onClick={this.onReserveCar}
                        disabled={chosenCar == null}
                        loading={booker.state.isProcessing}
                    >
                        Book it!
                    </Button>
                </div>
            );
        } else {
            return (
                <div className="available-form">
                </div>);
        }
    }
}

interface BookingStatusProps {
    booker: CarshareBooker;
}

export class BookingStatus extends React.Component<BookingStatusProps, {}> {
    render() {
        let message = "";
        let booker = this.props.booker;
        let bookedReq = booker.state.bookedRequest;
        if (bookedReq) {
            console.log(bookedReq);
            if (bookedReq.confirmed) {
                message = "Check your calendar for a confirmation of your booking!";
            } else {
                message = "The car's owner has been notified. You will receive an email if they have approved your request.";
            }
        }
        return (
            <div className="modal-container">
                <Modal show={message !== ""} onHide={() => {this.props.booker.resetPicker();}}>
                    <Modal.Header>
                        <Modal.Title>Booking request sent!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={() => {this.props.booker.resetPicker();}} appearance="primary">
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
