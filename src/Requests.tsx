import * as React from "react";
import moment from "moment";
import {Car, CarRequest, User} from "./types";
import {connect} from "react-redux";
import {deleteRequest, sendReminderForRequest} from "./redux/reducers/requestSlice";
import {ThunkDispatch} from "@reduxjs/toolkit";
import {Button, Container, Form, Spinner} from "react-bootstrap";

interface RequestsProps {
    requests: CarRequest[],
    status: string,
    cars: Car[],
    error: string,
    dispatch: ThunkDispatch<any, any, any>;
    user: User;
}

interface RequestsState {
    requestsToDelete: string[];
    activeRow: CarRequest | null;
}

export class Requests extends React.Component<RequestsProps, RequestsState> {
    constructor(props) {
        super(props);
        this.state = {
            requestsToDelete: [],
            activeRow: null,
        };
        this.setToDelete = this.setToDelete.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.handleReminder = this.handleReminder.bind(this);
    }


    setToDelete(val) {
        console.log(val.target);
        let value = val.target.id;
        let index = this.state.requestsToDelete.indexOf(value);
        let checked = val.target.checked;
        if (checked) {
            // add to the array, if it's not there
            if (index < 0) {
                console.log(`adding ${value} to ${this.state.requestsToDelete}`);
                this.setState({requestsToDelete: [...this.state.requestsToDelete, value]})
            }
        } else {
            // remove from the array, if it's there
            console.log(`removing ${value} from ${this.state.requestsToDelete}`);
            if (index >= 0) {
                let newReqs = this.state.requestsToDelete;
                newReqs.splice(index, 1);
                this.setState({requestsToDelete: newReqs});
            }
        }
    }

    handleDelete() {
        this.props.dispatch(deleteRequest(this.state.requestsToDelete));
    }

    async handleReminder() {
        if (this.state.activeRow && this.state.activeRow.eventId && (this.state.activeRow.confirmed === "FALSE")) {
            this.props.dispatch(sendReminderForRequest(this.state.activeRow));
        }
    }

    render() {
        let licenceMap = this.props.cars.map(x => {return x.Licence;});
        let cars = this.props.cars;
        let requests = this.props.requests.map(
            x => {
                let index = licenceMap.indexOf(x.vehicle);
                let desc = "";
                if (cars.length > 0) {
                    desc = cars[index].Description;
                }
                return {
                    eventId: x.eventId as string,
                    vehicle: x.vehicle,
                    description: desc,
                    start: moment(x.start).format("HH:mm DD MMM YYYY"),
                    end: moment(x.end).format("HH:mm DD MMM YYYY"),
                    confirmed: x.confirmed
                }
            });

        let requestLines = requests.map(x => {
            let desc = `${x.start} to ${x.end}: ${x.description}`;
            let remind = (x.confirmed === "TRUE") ? "" : <button className="link-button" onClick={this.handleReminder}>Not confirmed: send reminder to owner</button>;
            return (<Container className="request" key={x.eventId}>
                <Form.Check type="checkbox" checked={this.state.requestsToDelete.indexOf(x.eventId) >= 0} onChange={this.setToDelete} id={x.eventId} key={x.eventId}
                            label={desc}/>
                <div>{remind}</div>
                </Container>
            );
        })
        console.log(this.state.requestsToDelete);
        return (
            <div className="requests">
                <div className="error">{this.props.error}</div>
                <p className="request-table-caption">
                    <Button
                        className="selector"
                        onClick={this.handleDelete}
                    >
                        <Container className="button-spinner" >
                            <Spinner hidden={this.props.status !== "loading"} animation="border" size="sm" role="loading..."/>
                            Delete selected bookings
                        </Container>
                    </Button>
                </p>
                <Form>
                    <Form.Group>
                        {requestLines}
                    </Form.Group>
                </Form>
            </div>
        );
    };
}

const mapStateToProps = (state) => {
    let requests = state.requests.entries
        .filter(x => { return x.requester === state.user.user.email; })
        .sort((a, b) => {
            if (moment(a.start).isSame(b.start)) { return 0; }
            if (moment(a.start).isBefore(b.start)) { return -1; }
            return 1;
        });
    return {
        requests: requests,
        cars: state.cars.entries,
        status: state.requests.status,
        error: state.requests.error,
        user: state.user.user
    };
}

export default connect(mapStateToProps)(Requests)
