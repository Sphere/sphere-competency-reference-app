import { NsWidgetResolver } from "library/ws-widget/resolver/src/lib/widget-resolver.model"

export namespace NsWidgetLayoutTab {
  export interface ILayout {
    tabs: ITabDetails[]
  }
  export interface ITabDetails {
    tabKey: string
    tabTitle: string
    tabContent: NsWidgetResolver.IRenderConfigWithAnyData
  }
}
