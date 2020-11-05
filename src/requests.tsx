import * as React from "react";
import moment from "moment";
import {Transposit} from "transposit";
import {Button, Checkbox, Loader, Table} from "rsuite";
import {Car} from "./carbooker";
const { Column, HeaderCell, Cell } = Table;

const transposit = new Transposit(
    "https://lmc-carshare-89gbj.transposit.io"
);

interface RequestListProps {
    user: { name: string; email: string; };
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
                if (moment().isBefore(moment(x.end))) {
                    console.log(`${moment()} is before ${x.end}`);
                    return true;
                }
                console.log(`${moment()} is after ${x.end}`);
            }
            return false;
        });
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
        console.log(`deleting ${this.state.requestsToDelete.toString()}`);
        await transposit
            .run("delete_requests", {
                eventIds: this.state.requestsToDelete.toString()
            })
            .then(this.updateRequestsSuccess)
            .catch(response => {
                this.setState( {errorMessage: response.toString(), isLoading: false});
            });
        await this.updateRequests();
    }

    render() {
        if (this.state.isLoading) {
            return (
                <Loader size="lg" center content="Loading" vertical/>
            );
        }
        let requests = this.state.requests.map(
            x => {
                return {
                    eventId: x.eventId,
                    description: x.vehicle,
                    start: x.start,
                    end: x.end,
                    confirmed: x.confirmed
                }
            });
        return (
            <div className="request-table">
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
                    <Column width={100}>
                        <HeaderCell>Delete?</HeaderCell>
                        <Cell>
                            {rowData => {
                                return (
                                    <Checkbox inline value={rowData.eventId} onChange={this.setToDelete}>&nbsp;</Checkbox>
                                );
                            }}
                        </Cell>
                    </Column>
                    <Column flexGrow={2}>
                        <HeaderCell>Vehicle</HeaderCell>
                        <Cell dataKey="description" />
                    </Column>
                    <Column flexGrow={1}>
                        <HeaderCell>Booking Start</HeaderCell>
                        <Cell dataKey="start" />
                    </Column>
                    <Column flexGrow={1}>
                        <HeaderCell>Booking End</HeaderCell>
                        <Cell dataKey="end" />
                    </Column>
                </Table>
            </div>
        );
    };
}

interface Request {
    "threadId": string;
    "vehicle": Car;
    "requester": string;
    "start": string;
    "end": string;
    "eventId": string;
    "confirmed": boolean;
}