import * as React from "react";
import moment from "moment";
import {Transposit} from "transposit";
import {Button, Checkbox, Table} from "rsuite";
import {Car} from "./carbooker";
const { Column, HeaderCell, Cell } = Table;

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface RequestListProps {
    user: { name: string; email: string; };
    cars: Car[];
}

interface RequestListState {
    requests: Request[];
    requestsToDelete: string[];
    isLoading: boolean;
    errorMessage: string;
}

export class RequestList extends React.Component<RequestListProps, RequestListState> {
    constructor(props) {
        super(props);
        this.state = {
            requests: [],
            requestsToDelete: [],
            isLoading: true,
            errorMessage: ""
        };
        this.updateRequests = this.updateRequests.bind(this);
        this.updateRequestsSuccess = this.updateRequestsSuccess.bind(this);
        this.setToDelete = this.setToDelete.bind(this);
        this.handleDelete = this.handleDelete.bind(this);

        this.updateRequests();
    }

    async updateRequests() {
        this.setState({isLoading: true});
        await transposit
            .run("list_requests", {})
            .then(this.updateRequestsSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
    }

    updateRequestsSuccess(results) {
        let requests = results.results;
        requests.shift();
        let filtered_requests = requests.filter(x => {
            if (x.requester === this.props.user.email) {
                if (moment(x.end).isSameOrAfter(moment())) {
                    console.log(`${moment(x.end)} is on or after ${moment()}`);
                    return true;
                }
                console.log(`${moment(x.end)} is before ${moment()}`);
            }
            return false;
        });
        filtered_requests.map(x => {
            x.start = moment(x.start).format("YYYY-MM-DD HH:mm");
            x.end = moment(x.end).format("YYYY-MM-DD HH:mm");
            return x;
        })
        this.setState({
            requests: filtered_requests,
            isLoading: false
        });
        return filtered_requests;
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

    async handleDelete() {
        this.setState({isLoading: true});
        console.log(`deleting ${this.state.requestsToDelete.toString()}`);
        await transposit
            .run("delete_requests", {
                eventIds: this.state.requestsToDelete.toString()
            })
            .then(x => { console.log(x); this.updateRequests();})
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
    }

    render() {
        let requests = this.state.requests.map(
            x => {
                let desc = x.vehicle;
                let cars = this.props.cars.filter(car => { return (car.Licence === x.vehicle);});
                if (cars.length > 0) { desc = cars[0].Description; }
                return {
                    eventId: x.eventId,
                    description: desc,
                    start: x.start,
                    end: x.end,
                    confirmed: x.confirmed
                }
            });
        return (
            <div className="request-table">
                <div className="error">{this.state.errorMessage}</div>
                <p className="request-table-caption">
                    <Button
                        appearance="ghost"
                        loading={this.state.isLoading}
                        size="sm"
                        onClick={this.handleDelete}
                    >
                        Delete selected bookings
                    </Button>
                </p>
                <Table
                    height={400}
                    data={requests}
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
                    <Column width={80}>
                        <HeaderCell>Approved?</HeaderCell>
                        <Cell dataKey="confirmed" />
                    </Column>
                </Table>
            </div>
        );
    };
}

interface Request {
    "threadId": string;
    "vehicle": string;
    "requester": string;
    "start": string;
    "end": string;
    "eventId": string;
    "confirmed": boolean;
}