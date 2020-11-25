import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {Checkbox, ControlLabel, Form, FormControl, FormGroup, HelpBlock, Loader} from "rsuite";

interface MyCarProps {
    user: User;
    cars: Car[];
    status: string;
    error: string;
    dispatch: ThunkDispatch<any, any, any>;
    myCar: Car | null;
}

interface MyCarState {
    modifiedCar: Car;
}

export class MyCar extends React.Component<MyCarProps, MyCarState> {
    constructor(props) {
        super(props);
        this.state = {
            modifiedCar: {
                Make: "",
                Model: "",
                Timestamp: "",
                Description: "",
                Features: [] as string[],
                Confirm: false,
                Email: "",
                AlwaysAvailable: true
            } as Car
        }
        this.setFormValue = this.setFormValue.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.myCar && (prevProps.myCar === null)) {
            this.setState({
                modifiedCar: {
                    Make: this.props.myCar.Make,
                    Model: this.props.myCar.Model,
                    Licence: this.props.myCar.Licence,
                    Email: this.props.myCar.Email,
                    Features: this.props.myCar.Features,
                    Confirm: this.props.myCar.Confirm,
                    Color: this.props.myCar.Color,
                    AlwaysAvailable: this.props.myCar.AlwaysAvailable
                } as Car
            })
        }
    }

    setFormValue(event) {
        console.log(event);
        this.setState({modifiedCar: event as Car});
    }

    render() {
        if (this.props.status === "loading") {
            return (
                <div>
                    <Loader size="lg" center content="Loading" vertical/>
                </div>
            );
        }

        let car_div = (
            <div>
                You don't own a car in the carshare!
            </div>
        )
        if (this.props.myCar) {
            let car = this.props.myCar;
            let feat_list = car.Features.map(feat => {
                return (<li key={feat}>{feat}</li>);
            });
            car_div = (
                <div key={car.Licence} className="car_item">
                    <Form formValue={this.state.modifiedCar} onChange={formValue => this.setFormValue(formValue)}>
                        <FormGroup>
                            <ControlLabel>Licence</ControlLabel>
                            <FormControl
                                name="Licence"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Make</ControlLabel>
                            <FormControl
                                name="Make"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Model</ControlLabel>
                            <FormControl
                                name="Model"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Color</ControlLabel>
                            <FormControl
                                name="Color"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Email</ControlLabel>
                            <FormControl
                                name="Email"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Licence</ControlLabel>
                            <FormControl
                                name="Licence"
                            />
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Require approval of all requests</ControlLabel>
                            <FormControl
                                name="Confirm"
                                inline
                            >
                                <Checkbox/>
                            </FormControl>
                        </FormGroup>

                    </Form>
                    <div className="car_features">
                        Features:
                        <ul>{feat_list}</ul>
                    </div>
                    <div className="car_confirm">{car.Confirm? "Requires owner approval for requests": ""}</div>
                    <div className="car_owner">Owner email: {car.Email}</div>
                </div>);
        }

        // "Description": string;
        // "Features": string[];
        // "Email": string;
        // "Confirm": boolean;

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
        myCar: my_car
    };
}
export default connect(mapStateToProps)(MyCar)
