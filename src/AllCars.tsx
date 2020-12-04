import * as React from "react";
import {Car, User} from "./types";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {connect} from "react-redux";
import {Spinner, Container} from "react-bootstrap";
import {Multiselect} from 'react-widgets';

interface AllCarsProps {
    user: User;
    cars: Car[];
    status: string;
    error: string;
    features: string[];
    dispatch: ThunkDispatch<any, any, any>;
}

interface AllCarsState {
    selectedFeatures: string[];
}

export class AllCars extends React.Component<AllCarsProps, AllCarsState> {
    constructor(props) {
        super(props);
        this.state = {
            selectedFeatures: [] as string[]
        };
        this.onTagPick = this.onTagPick.bind(this);
    }

    onTagPick(event) {
        console.log(`pick ${event.toString()}`);
        this.setState({selectedFeatures: event as string[]});
    }

    render() {
        if (this.props.status === "loading") {
            return (
                <div>
                    <Spinner className="main-spinner" animation="border" role="status"/>
                </div>
            );
        }

        // "Description": string;
        // "Features": string[];
        // "Email": string;
        // "Confirm": boolean;

        let car_list = this.props.cars
            .filter(car => {
                if (this.state.selectedFeatures.length > 0) {
                    return this.state.selectedFeatures.every(feature => {
                        return car.Features.some(feat => {
                            return feat === feature;
                        });
                    })
                } else {
                    return true;
                }
            }).map(car => {
            let feat_list = car.Features.map(feat => {
                return (<li key={feat}>{feat}</li>);
            });
            return (
                <Container key={car.Licence} className="car_item">
                    <h4 className="car_name">{car.Description}</h4>
                    <div className="car_features">
                        Features:
                        <ul>{feat_list}</ul>
                    </div>
                    <div className="car_confirm">{car.Confirm? "Requires owner approval for requests": ""}</div>
                    <div className="car_owner">Owner email: {car.Email}</div>
                    <div className="car_notes">Notes: {car.Notes}</div>
                </Container>);
        })
        return (
            <Container>
                <div className="feature-select">
                    <Multiselect
                        className="selector"
                        size="sm"
                        style={{width: 300}}
                        data={this.props.features}
                        value={this.state.selectedFeatures}
                        onChange={this.onTagPick}
                        placeholder="filter by feature"
                    />
                </div>
                <ul className="car-list">
                    {car_list}
                </ul>
            </Container>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        user: state.user.user,
        cars: state.cars.entries,
        status: state.cars.status,
        error: state.cars.error,
        features: state.allFeatures.entries
    };
}
export default connect(mapStateToProps)(AllCars)
