import * as React from "react";
import {Button, Checkbox, Table} from "rsuite";
import {Car, CarRequest} from "./types";
import {connect} from "react-redux";
import {deleteRequest, sendReminderForRequest} from "./redux/reducers/requestSlice";
import {ThunkDispatch} from "@reduxjs/toolkit";

const { Column, HeaderCell, Cell } = Table;

interface RequestListProps {
    requests: CarRequest[],
    status: string,
    cars: Car[],
    error: string,
    dispatch: ThunkDispatch<any, any, any>;
}

interface RequestListState {
    requestsToDelete: string[];
    activeRow: CarRequest | null;
}

export class RequestList extends React.Component<RequestListProps, RequestListState> {
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


    setToDelete(value, checked) {
        let index = this.state.requestsToDelete.indexOf(value);
        if (checked) {
            // add to the array, if it's not there
            if (index < 0) {
                this.state.requestsToDelete.push(value);
            }
        } else {
            // remove from the array, if it's there
            if (index >= 0) {
                this.state.requestsToDelete.splice(index, 1);
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
                    eventId: x.eventId,
                    vehicle: x.vehicle,
                    description: desc,
                    start: x.start,
                    end: x.end,
                    confirmed: x.confirmed
                }
            });
        let loading = (this.props.status === "loading");
        return (
            <div className="requests">
                <div className="error">{this.props.error}</div>
                <p className="request-table-caption">
                    <Button
                        appearance="ghost"
                        loading={loading}
                        size="sm"
                        onClick={this.handleDelete}
                    >
                        Delete selected bookings
                    </Button>
                </p>
                <Table
                    height={400}
                    data={requests}
                    onRowClick={data => {
                        this.setState({activeRow: data});
                    }}
                >
                    <Column width={80}>
                        <HeaderCell>Delete?</HeaderCell>
                        <Cell>
                            {rowData => {
                                return (
                                    <Checkbox defaultChecked={false} inline value={rowData.eventId} onChange={this.setToDelete}>&nbsp;</Checkbox>
                                );
                            }}
                        </Cell>
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Vehicle</HeaderCell>
                        <Cell dataKey="description" />
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Booking Start</HeaderCell>
                        <Cell dataKey="start" />
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Booking End</HeaderCell>
                        <Cell dataKey="end" />
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Awaiting approval?</HeaderCell>
                        <Cell>
                            {rowData => {
                                if (rowData.confirmed === "TRUE") {
                                    return(<div/>);
                                }
                                return (
                                    <Button
                                        appearance="link"
                                        disabled={!(this.state.activeRow !== null && this.state.activeRow.eventId === rowData.eventId)}
                                        size="sm"
                                        value={rowData}
                                        onClick={this.handleReminder}
                                    >
                                        Send reminder
                                    </Button>
                                );
                            }}
                        </Cell>
                    </Column>
                </Table>
            </div>
        );
    };
}

const mapStateToProps = (state) => {
    return {
        requests: state.requests.entries,
        cars: state.cars.entries,
        status: state.requests.status,
        error: state.requests.error
    };
}

export default connect(mapStateToProps)(RequestList)
