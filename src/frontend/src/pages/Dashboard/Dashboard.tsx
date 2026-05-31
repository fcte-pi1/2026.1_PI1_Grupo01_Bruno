import { Card } from '../../components/Card'
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
        <TemperatureChart />
        </div>
    )
}