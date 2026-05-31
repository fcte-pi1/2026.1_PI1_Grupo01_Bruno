import { Card } from '../../components/Card'
import { Battery } from '../../components/Battery'

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
        </div>
    )
}