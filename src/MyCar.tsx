import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {Button, Checkbox, CheckboxGroup, ControlLabel, Form, FormControl, FormGroup, Loader} from "rsuite";
import {updateCar} from "./redux/reducers/carSlice";

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
    carForm: any;
}

export class MyCar extends React.Component<MyCarProps, MyCarState> {
    constructor(props) {
        super(props);
        this.state = {
            carForm: {}
        }
        this.setFormValue = this.setFormValue.bind(this);
        this.handleSave = this.handleSave.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.myCar && (prevProps.myCar === null)) {
            let checkboxes = ["Confirm", "AlwaysAvailable"].filter(x => {return this.props.myCar[x]});
            this.setState({
                carForm: {
                    Make: this.props.myCar.Make,
                    Model: this.props.myCar.Model,
                    Licence: this.props.myCar.Licence,
                    Email: this.props.myCar.Email,
                    Features: this.props.myCar.Features,
                    Checkboxes: checkboxes,
                    Color: this.props.myCar.Color
                }
            });
        }
    }
    handleSave() {
        let newCar = {
            Make: this.state.carForm.Make,
            Model: this.state.carForm.Model,
            Licence: this.state.carForm.Licence,
            Email: this.state.carForm.Email,
            Features: this.state.carForm.Features,
            Color: this.state.carForm.Color,
            Confirm: this.state.carForm.Checkboxes.filter(x => {return x === "Confirm"}).length > 0,
            AlwaysAvailable: this.state.carForm.Checkboxes.filter(x => {return x === "AlwaysAvailable"}).length > 0
        } as Car;
        console.log(`Confirm is ${newCar.Confirm}`);
        this.props.dispatch(updateCar(newCar));
    }

    setFormValue(event) {
        let newCar = {
            Model: event.Model,
            Make: event.Make,
            Color: event.Color,
            Email: event.Email,
            Features: event.Features,
            Licence: event.Licence,
            Checkboxes: event.Checkboxes
        };
        this.setState({carForm: newCar});
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
            let features = this.props.allFeatures.map(x => {
                return (<Checkbox value={x} key={x}>{x}</Checkbox>);
            })
            car_div = (
                <div key={this.props.myCar.Licence} className="car_item">
                    <div className="save-button">
                    <Button
                        appearance="ghost"
                        loading={this.props.status === "loading"}
                        size="sm"
                        onClick={this.handleSave}
                    >
                        Save my changes
                    </Button>
                    </div>

                    <Form layout="inline" formValue={this.state.carForm} onChange={formValue => this.setFormValue(formValue)}>
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
                            <FormControl
                                name="Checkboxes"
                                inline
                                accepter={CheckboxGroup}
                            >
                                <Checkbox value="Confirm">Require approval of all requests</Checkbox>
                                <Checkbox value="AlwaysAvailable">Car is available by default</Checkbox>
                            </FormControl>
                        </FormGroup>
                        <FormGroup>
                            <ControlLabel>Available Features:</ControlLabel>
                            <FormControl
                                name="Features"
                                inline
                                accepter={CheckboxGroup}
                            >
                                {features}
                            </FormControl>
                        </FormGroup>

                    </Form>
                </div>);
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
