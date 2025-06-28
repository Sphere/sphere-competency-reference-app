import { NsWidgetResolver } from "library/ws-widget/resolver/src/lib/widget-resolver.model"

export interface ISelectorResponsive {
  selectFrom: ISelectorResponsiveUnit[]
  type?: string
  subType?: string
}

export interface ISelectorResponsiveUnit {
  minWidth: number
  maxWidth: number
  widget: NsWidgetResolver.IRenderConfigWithAnyData
}
