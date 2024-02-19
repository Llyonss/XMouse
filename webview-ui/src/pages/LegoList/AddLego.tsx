import type { Component } from "solid-js";
import { createSignal, For, Match, Switch } from 'solid-js'
import { Tabs } from '@ark-ui/solid'

export default () => {
    return (
        <div>
            <span>组件名：</span><input></input>
            <span>组件依赖</span><textarea></textarea>
            <span>组件分类：</span><input></input>
            <span>组件ICON：</span><input></input>
            <span>组件内容</span><textarea></textarea>
            <span>组件配置</span><textarea></textarea>
        </div>
    )
}