import { splitProps } from 'solid-js'
import Test from './lego.svg'
export default (props: any) => {
    const [lego, other] = splitProps(props, ['name'])
    return (
        <div class="lego-list__item" {...other}>
            <div class="lego-list__item-icon">
                <img src={Test}></img>
            </div>
            <div class="lego-list__item-label">
                {lego.name}
            </div>
        </div>
    )
}