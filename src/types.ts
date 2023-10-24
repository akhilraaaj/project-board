export type Id = string | number;

export type Status = {
    id: Id,
    title: string,
    backgroundColor: string,
};

export type Task = {
    id: Id,
    statusId: Id,
    content: string,
}