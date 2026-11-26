import { CatalogView } from "@/views/catalog"

export default function Page(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  return <CatalogView searchParams={props.searchParams} />
}
