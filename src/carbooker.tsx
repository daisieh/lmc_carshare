import * as React from "react";
import moment from "moment";
import {Button, DatePicker, Modal, Radio, TagPicker} from "rsuite";
import {CarshareBooker} from "./CarshareBooker";

interface SearchAvailabilityProps {
    booker: CarshareBooker;
}

interface SearchAvailabilityState {
}

export class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagPick = this.handleTagPick.bind(this);
    }

    handleStartChange(event) {
        if (event) {
            this.props.booker.updateTimes(moment(event.toString()).format(), "");
        } else {
            this.props.booker.updateTimes("", "");
        }
        console.log(this.props.booker.state.pendingRequest.start);
    }

    handleEndChange(event) {
        if (event) {
            this.props.booker.updateTimes("", moment(event.toString()).format());
        } else {
            this.props.booker.updateTimes("", "");
        }
    }

    handleSubmit() {
        this.setState({errorMessage: ""});
        this.props.booker.getAvailableCars();
    }

    handleTagPick(event) {
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
                        value={new Date(booker.state.pendingRequest.start)}
                        disabled={disabled}
                    />
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleEndChange}
                        value={new Date(booker.state.pendingRequest.end)}
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
                        onChange={this.handleTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    appearance="ghost"
                    className="selector"
                    loading={booker.state.isProcessing}
                    size="sm"
                    onClick={this.handleSubmit}
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
        this.onClick = this.onClick.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    onClick(value) {
        let req = this.props.booker.state.pendingRequest;
        req.vehicle = value;
        this.props.booker.setState({pendingRequest: req});
    }

    handleSubmit(event) {
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
                    <Radio checked={isChosenCar} onChange={this.onClick} value={car.Email}>
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
                        onClick={this.handleSubmit}
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
    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
    }

    close() {
        this.props.booker.resetPicker();
    }

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
                <Modal show={message !== ""} onHide={this.close}>
                    <Modal.Header>
                        <Modal.Title>Booking request sent!</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <p>{message}</p>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.close} appearance="primary">
                            Ok
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        );
    }
}
