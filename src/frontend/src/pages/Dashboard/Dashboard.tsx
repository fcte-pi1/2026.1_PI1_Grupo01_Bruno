import { Card } from '../../components/Card'

export function Dashboard() {
    return (
        <div>
            <h1>Dashboard</h1>

            <Card
                icon="analytics"
                label="Total de usuários"
                value="1.240"
            />
        </div>
    )
}