import * as React from "react";
import DatePicker from 'react-date-picker';

export interface DateProps { foo: Date; }

export class MyDate extends React.Component<DateProps, {}> {

  onChange = foo => this.setState({ foo })

  render() {
    return (
      <div>
        <DatePicker
          onChange={this.onChange}
          value={this.props.foo}
        />
      </div>
    );
  }
}
