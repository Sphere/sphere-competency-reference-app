import { NsWidgetResolver } from "library/ws-widget/resolver/src/lib/widget-resolver.model"

export interface IIntranetSelector {
  url?: string
  isIntranet?: IIntranetSelectorUnit
  isNotIntranet?: IIntranetSelectorUnit
}

export interface IIntranetSelectorUnit {
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}
