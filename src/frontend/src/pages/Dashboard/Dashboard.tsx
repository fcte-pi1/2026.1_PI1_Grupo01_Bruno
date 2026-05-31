import { Card } from '../../components/Card'
import { Battery } from '../../components/Battery'
import { Connection } from '../../components/Connection'
import { TemperatureChart } from '../../components/Charts/TemperatureChart';


export function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>

            <Card
                icon="analytics"
                label="Total de usuários"
                value="1.240"
            />

            <Battery level={80} voltage={7.4} />

            <Battery level={50} />

            <Battery level={20} voltage={3.7} />

            <Battery level={0} />


            <Connection status="connected" port="COM3" />

            <Connection status="warn" port="COM3" />

            <Connection status="disconnected" port="COM3" />
        <TemperatureChart />
        </div>
    )
}