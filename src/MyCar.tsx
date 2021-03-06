import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {Multiselect} from 'react-widgets';
import {updateCar} from "./redux/reducers/carSlice";
import {Button, Spinner, Form, Container} from "react-bootstrap";

interface MyCarProps {
    user: User;
    cars: Car[];
    status: string;
    error: string;
    dispatch: ThunkDispatch<any, any, any>;
    myCar: Car;
    allFeatures: string[];
}

interface MyCarState {
    Licence: string;
    Make: string;
    Model: string;
    Color: string;
    Notes: string;
    Features: string[];
    Confirm: boolean;
    AlwaysAvailable: boolean;
}

export class MyCar extends React.Component<MyCarProps, MyCarState> {
    constructor(props) {
        super(props);
        this.state = {
            Licence: "",
            Make: "",
            Model: "",
            Color: "",
            Notes: "",
            Features: [] as string[],
            Confirm: true,
            AlwaysAvailable: true,
        }
        this.setFormValue = this.setFormValue.bind(this);
        this.handleSave = this.handleSave.bind(this);
        this.setCheckbox = this.setCheckbox.bind(this);
        this.onTagPick = this.onTagPick.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.myCar && (prevProps.myCar === null)) {
            this.setState({
                Licence: this.props.myCar.Licence,
                Make: this.props.myCar.Make,
                Model: this.props.myCar.Model,
                Features: this.props.myCar.Features,
                Confirm: this.props.myCar.Confirm,
                AlwaysAvailable: this.props.myCar.AlwaysAvailable,
                Color: this.props.myCar.Color,
                Notes: this.props.myCar.Notes
            });
        }
    }

    handleSave() {
        let newCar = {
            Make: this.state.Make,
            Model: this.state.Model,
            Licence: this.state.Licence,
            Email: this.props.user.email, // this can't change
            Features: this.state.Features,
            Color: this.state.Color,
            Notes: this.state.Notes,
            Confirm: this.state.Confirm,
            AlwaysAvailable: this.state.AlwaysAvailable,
            BookingCalendar: "", // this can't change
            AvailableCalendar: "" //this can't change
        } as Car;
        console.log(`Confirm is ${newCar.Confirm}`);
        this.props.dispatch(updateCar(newCar));
    }

    setFormValue(event) {
        let newState = this.state;
        newState[event.currentTarget.id] = event.currentTarget.value;
        this.setState(newState);
    }

    setCheckbox(event) {
        let newState = this.state;
        newState[event.currentTarget.id] = event.currentTarget.checked;
        this.setState(newState);
    }

    onTagPick(event) {
        this.setState({Features: event as string[]});
    }

    render() {
        if (this.props.status === "loading") {
            return (
                <div>
                    <Spinner className="main-spinner" animation="border" role="status"/>
                </div>
            );
        }
        let car_links = (
            <div className="add-new-car">
                You don't have a car in the carshare! Fill out the form to add your car:
            </div>
        );
        if (this.props.myCar) {
            let booking_url = `https://calendar.google.com/calendar/embed?src=${this.props.myCar.BookingCalendar}&ctz=America%2FVancouver`;
            let avail_url = `https://calendar.google.com/calendar/embed?src=${this.props.myCar.AvailableCalendar}&ctz=America%2FVancouver`;
            car_links = (<div className="my-car-message">
                    <div className="calendar-message">
                        Your car's booking calendar is available <a href={booking_url} target="_blank" rel="noopener noreferrer">here</a>.
                    </div>
                    {this.props.myCar.AlwaysAvailable ?
                        (<div/>) :
                        (<div className="calendar-message">
                            Your car is set to only be available at the times listed on <a href={avail_url} target="_blank" rel="noopener noreferrer">this calendar</a>.
                        </div>)
                    }
                </div>
            );
        }
        let car_div = (
            <Container fluid="md" key="car" className="car-form">
                {car_links}
                <Form>
                    <Form.Group controlId="Licence">
                        <Form.Label>Licence</Form.Label>
                        <Form.Control value={this.state.Licence} onChange={this.setFormValue}/>
                    </Form.Group>
                    <Form.Group controlId="Make">
                        <Form.Label>Make</Form.Label>
                        <Form.Control value={this.state.Make} onChange={this.setFormValue}/>
                    </Form.Group>
                    <Form.Group controlId="Model">
                        <Form.Label>Model</Form.Label>
                        <Form.Control value={this.state.Model} onChange={this.setFormValue}/>
                    </Form.Group>
                    <Form.Group controlId="Color">
                        <Form.Label>Color</Form.Label>
                        <Form.Control value={this.state.Color} onChange={this.setFormValue}/>
                    </Form.Group>
                    <Form.Group controlId="Notes">
                        <Form.Label>Notes</Form.Label>
                        <Form.Control value={this.state.Notes} onChange={this.setFormValue}/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Check type="checkbox" checked={this.state.Confirm} onChange={this.setCheckbox}
                                    id="Confirm" key="Confirm"
                                    label="Require approval of all requests"/>
                        <Form.Check type="checkbox" checked={this.state.AlwaysAvailable} onChange={this.setCheckbox}
                                    id="AlwaysAvailable" key="AlwaysAvailable"
                                    label="Vehicle is available by default"/>
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Features</Form.Label>
                        <Multiselect
                            className="selector"
                            data={this.props.allFeatures}
                            value={this.state.Features}
                            onChange={this.onTagPick}
                        />
                    </Form.Group>
                </Form>
                <div className="save-button">
                    <Button
                        className="selector"
                        onClick={this.handleSave}
                    >
                        <Container className="button-spinner">
                            <Spinner hidden={this.props.status !== "loading"} animation="border" size="sm"
                                     role="loading..."/>
                            {this.props.myCar ? "Save my changes" : "Add new car"}
                        </Container>
                    </Button>
                </div>
            </Container>
        );
        if (this.props.myCar) {
        }

        return (
            <div>
                {car_div}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    let my_car = null as Car | null;
    let car_matches = state.cars.entries.filter(car => {
        return state.user.user.email === car.Email;
    })
    if (car_matches.length > 0) {
        console.log(`my car is ${car_matches[0].Description}`);
        my_car = car_matches[0];
    }

    return {
        user: state.user.user,
        cars: state.cars.entries,
        status: state.cars.status,
        error: state.cars.error,
        allFeatures: state.allFeatures.entries,
        myCar: my_car
    };
}
export default connect(mapStateToProps)(MyCar)
