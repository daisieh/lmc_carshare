import * as React from "react";
import {Button, Checkbox, Table} from "rsuite";
import {CarRequest, CarshareBooker} from "./dataModel";
const { Column, HeaderCell, Cell } = Table;

interface RequestListProps {
    booker: CarshareBooker;
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

    async handleDelete() {
        console.log(`deleting ${this.state.requestsToDelete.toString()}`);
        await this.props.booker.deleteRequests(this.state.requestsToDelete);
    }

    async handleReminder() {
        if (this.state.activeRow && this.state.activeRow.eventId && (this.state.activeRow.confirmed === "FALSE")) {
            console.log(this.state.activeRow);
            await this.props.booker.sendReminderForRequest(this.state.activeRow.eventId);
        }
    }

    render() {
        let requests = this.props.booker.state.requests.map(
            x => {
                let car = this.props.booker.getChosenCar();
                let desc = "";
                if (car) {
                    desc = car.Description;
                }
                return {
                    eventId: x.eventId,
                    description: desc,
                    start: x.start,
                    end: x.end,
                    confirmed: x.confirmed
                }
            });
        let errorMessage = this.props.booker.state.errorMessage;
        let loading = this.props.booker.state.isProcessing;
        return (
            <div className="requests">
                <div className="error">{errorMessage}</div>
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

