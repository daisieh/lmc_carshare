import * as React from "react";
import moment from "moment";
import {Button, DatePicker, Modal, Radio, TagPicker} from "rsuite";
import {Transposit} from "transposit";

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface SearchAvailabilityProps {
    updateTime: (startTime: string, endTime: string) => void;
    submitTimes: () => void;
    selectFeatures: (features: string[] | null) => void;
    startTimeValue: string;
    endTimeValue: string;
    carsListed: boolean;
    booking: Booking | null;
    availableFeatures: string[];
    selectedFeatures: string[];
    isSearching: boolean;
}

interface SearchAvailabilityState {
}

class SearchAvailabilityForm extends React.Component<SearchAvailabilityProps, SearchAvailabilityState> {
    constructor(props) {
        super(props);
        this.handleStartChange = this.handleStartChange.bind(this);
        this.handleEndChange = this.handleEndChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleTagPick = this.handleTagPick.bind(this);
        this.props.updateTime.bind(this);
        this.props.submitTimes.bind(this);
        this.props.selectFeatures.bind(this);
        this.props.updateTime("", "");
    }

    handleStartChange(event) {
        if (event) {
            this.props.updateTime(moment(event.toString()).format(), "");
        } else {
            this.props.updateTime("", "");
        }
    }

    handleEndChange(event) {
        if (event) {
            this.props.updateTime("", moment(event.toString()).format());
        } else {
            this.props.updateTime("", "");
        }
    }

    handleSubmit() {
        this.setState({errorMessage: ""});
        this.props.submitTimes();
    }

    handleTagPick(event) {
        this.props.selectFeatures(event as string[] | null);
    }

    render() {
        let disabled = this.props.carsListed || (this.props.booking !== null);
        let inThePast = "";
        if (moment(this.props.startTimeValue).isBefore(moment())) {
            inThePast = "WARNING! The selected time slot is in the past.";
        }
        let feat_array:{label: string, value: string}[] = this.props.availableFeatures.map(x => { return {"value": x, "label": x}; });

        return (
            <div className="search-form">
                <p className={disabled?"caption-disabled":"caption"}>Select the date and time you'd like to book.</p>
                <div className="date-select">
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleStartChange}
                        value={new Date(this.props.startTimeValue)}
                        disabled={disabled}
                    />
                    <DatePicker
                        className="selector"
                        size="sm"
                        format="YYYY-MM-DD HH:mm"
                        onChange={this.handleEndChange}
                        value={new Date(this.props.endTimeValue)}
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
                        value={this.props.selectedFeatures}
                        onChange={this.handleTagPick}
                        disabled={disabled}
                    />
                </div>
                <Button
                    appearance="ghost"
                    className="selector"
                    loading={this.props.isSearching}
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
    cars: Car[];
    chooseCar: (chosenCar: string) => void;
    getChosenCar: () => Car | null;
    reserveCar: () => void;
    carsListed: boolean;
    isBooking: boolean;
}

class AvailableCars extends React.Component<AvailableCarsProps, {}> {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.props.chooseCar.bind(this);
        this.props.getChosenCar.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.props.reserveCar.bind(this);
    }

    onClick(value) {
        this.setState(() => {
            this.props.chooseCar(value);
        });
    }

    handleSubmit(event) {
        event.preventDefault();
        this.props.reserveCar();
    }

    render() {
        if (this.props.carsListed) {
            let chosenCar = this.props.getChosenCar();
            let email = "";
            if (chosenCar != null) {
                email = chosenCar.Email;
            }
            console.log(`there are ${this.props.cars.length} cars, chosen car is ${email}`);
            if (this.props.cars.length === 0) {
                return (
                    <div className="available-form">
                        No cars available at this time
                    </div>
                );
            }
            let rows = this.props.cars.map((car) => {
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
                        loading={this.props.isBooking}
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
    booking: Booking | null;
    resetBooking: () => void;
}

class BookingStatus extends React.Component<BookingStatusProps, {}> {
    constructor(props) {
        super(props);
        this.props.resetBooking.bind(this);
        this.close = this.close.bind(this);
    }

    close() {
        this.props.resetBooking();
    }

    render() {
        let message = "";
        if (this.props.booking) {
            console.log(this.props.booking);
            if (this.props.booking.confirmed) {
                message = "Check your email for a confirmation of your booking!";
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

interface CarshareBookerProps {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
    availableFeatures: string[];
}

interface CarshareBookerState {
    startTime: string;
    endTime: string;
    user: { name: string; email: string; };
    cars: Car[];
    chosenCar: string;
    booking: Booking | null;
    carsListed: boolean;
    errorMessage: string;
    selectedFeatures: string[];
    isSearching: boolean;
    isBooking: boolean;
}

export class CarshareBooker extends React.Component<CarshareBookerProps, CarshareBookerState> {
    constructor(props) {
        super(props);
        this.state = {
            startTime: "",
            endTime: "",
            cars: this.props.cars,
            chosenCar: this.props.chosenCar,
            user: this.props.user,
            booking: null,
            carsListed: false,
            errorMessage: "",
            selectedFeatures: [],
            isSearching: false,
            isBooking: false
        };
        this.updateAvailableCars = this.updateAvailableCars.bind(this);
        this.updateTimes = this.updateTimes.bind(this);
        this.bookCar = this.bookCar.bind(this);
        this.chooseCar = this.chooseCar.bind(this);
        this.selectFeatures = this.selectFeatures.bind(this);
        this.carsAvailableSuccess = this.carsAvailableSuccess.bind(this);
        this.carBookedSuccess = this.carBookedSuccess.bind(this);
        this.getChosenCar = this.getChosenCar.bind(this);
        this.resetPicker = this.resetPicker.bind(this);
        this.updateTimes("","");
    }

    updateTimes(startTime: string, endTime: string) {
        let start = moment().add(1,'hour').startOf('hour');
        let end = start.clone().add(1,'hour');
        if (startTime === "" && endTime === "") {
            console.log(`reset to ${start.format()} and ${end.format()}`);
            this.setState({
                startTime: start.format(),
                endTime: end.format(),
            });
            return;
        } else if (endTime !== "") {
            end = moment(endTime);
            // set start to at least an hour before
            if (start.add(1, "hour").isAfter(end)) {
                start = end.clone().subtract(1, "hour");
            }
        } else if (startTime !== "") {
            start = moment(startTime);
            // set end to at least an hour after
            if (end.subtract(1,"hour").isBefore(start)) {
                end = start.clone().add(1, "hour");
            }
        }
        this.setState({
            startTime: start.format(),
            endTime: end.format()
        });
        this.chooseCar("");
    }

    async updateAvailableCars() {
        this.setState({isSearching: true});
        await transposit
            .run("get_cars_available_for_time", {start: this.state.startTime, end: this.state.endTime})
            .then(this.carsAvailableSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isSearching: false});
            });
    }

    carsAvailableSuccess(results) {
        this.chooseCar("");
        let filtered_cars = results.results[0].cars.filter(x => {
            let res = true;
            for (let i in this.state.selectedFeatures) {
                if (x.Features.indexOf(this.state.selectedFeatures[i]) < 0) {
                    res = false;
                }
            }
            return res;
        });
        this.setState({
            cars: filtered_cars as Car[],
            chosenCar: "",
            carsListed: true,
            isSearching: false
        });
        return filtered_cars;
    }

    carBookedSuccess(results) {
        this.setState({
            chosenCar: "",
            cars: [],
            carsListed: false,
            booking: results.results[0] as Booking,
            isBooking: false
        });
        console.log(results);
        return results;
    }

    chooseCar(car: string) {
        this.setState({chosenCar: car});
    }

    selectFeatures(features: string[] | null) {
        if (features) {
            this.setState({selectedFeatures: features});
        } else {
            this.setState({selectedFeatures: []});
        }
    }

    getChosenCar() {
        if (this.state.cars.length > 0) {
            let carEmails = this.state.cars.map((x) => {
                return x.Email;
            });
            let carIndex = carEmails.indexOf(this.state.chosenCar);
            if (carIndex < 0) {
                return null;
            }
            return this.state.cars[carIndex];
        }
        return null;
    }

    resetPicker() {
        this.setState({
                cars: [],
                chosenCar: "",
                booking: null,
                carsListed: false,
                errorMessage: "",
                selectedFeatures: [],
                isSearching: false,
                isBooking: false
            }
        );
        this.updateTimes("","");
    }

    async bookCar() {
        this.setState({isBooking: true});
        await transposit
            .run("create_reservation", {
                start: this.state.startTime,
                end: this.state.endTime,
                requester: this.state.user.email,
                vehicle: this.state.chosenCar
            })
            .then(this.carBookedSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isBooking: false});
            });
    }

    render() {
        return (
            <div>
                <SearchAvailabilityForm
                    updateTime={this.updateTimes}
                    submitTimes={this.updateAvailableCars}
                    selectFeatures={this.selectFeatures}
                    startTimeValue={this.state.startTime}
                    endTimeValue={this.state.endTime}
                    selectedFeatures={this.state.selectedFeatures}
                    carsListed={this.state.carsListed}
                    booking={this.state.booking}
                    availableFeatures={this.props.availableFeatures}
                    isSearching={this.state.isSearching}
                />
                <AvailableCars
                    cars={this.state.cars}
                    chooseCar={this.chooseCar}
                    getChosenCar={this.getChosenCar}
                    reserveCar={this.bookCar}
                    carsListed={this.state.carsListed}
                    isBooking={this.state.isBooking}
                />
                <BookingStatus booking={this.state.booking} resetBooking={this.resetPicker}/>
                <div className="error">{this.state.errorMessage}</div>
                <Button appearance="ghost" className="reset-button" size="sm" onClick={this.resetPicker}>Reset booking</Button>
            </div>
        );
    };

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

interface Booking {
    "threadId": string,
    "requester": string,
    "eventId": string,
    "start": string,
    "end": string,
    "confirmed": boolean,
    "vehicle": string
}