import {API} from '@api';
import {
  getNotesByContactFailed,
  getNotesByContactFetched,
  getNotesByContactSuccess,
} from '../actions';
import {getNotesByContact} from '../operations';

jest.mock('@api', () => ({
  API: {
    Notes: {
      getAllByContact: jest.fn(),
    },
  },
}));
const getAllByContact = API.Notes.getAllByContact as jest.Mock<{}>;

describe('Redux', () => {
  describe('NOTES', () => {
    describe('Operations', () => {
      let dispatch;
      const contactId = 5;

      beforeEach(() => {
        dispatch = jest.fn();
        getAllByContact.mockReset();
      });

      describe('getNotesByContact', () => {
        it('should not do anything if it is already fetching', async () => {
          const getState = () => ({
            getNotesByContact: {
              isFetching: true,
            },
          });
          await getNotesByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(0);
        });

        it('should not do anything if every element has already been fetched', async () => {
          const getState = () => ({
            contacts: {
              [contactId]: {
                statistics: {
                  number_of_notes: 5,
                },
                notes: [1, 2, 3, 4, 5],
              },
            },
            getNotesByContact: {
              isFetching: false,
            },
          });
          await getNotesByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(0);
          expect(getAllByContact.mock.calls.length).toBe(0);
        });

        it('should trigger fetch action (success)', async () => {
          const res = {
            data: ['a'],
          };
          const fetchedPageCount = 3;
          const getState = () => ({
            contacts: {
              [contactId]: {},
            },
            getNotesByContact: {
              isFetching: false,
              fetchedPageCount: {
                [contactId]: fetchedPageCount,
              },
            },
          });
          getAllByContact.mockReturnValue(Promise.resolve(res));
          await getNotesByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(2);
          expect(dispatch.mock.calls[0]).toEqual([
            getNotesByContactFetched(contactId),
          ]);
          expect(dispatch.mock.calls[1]).toEqual([
            getNotesByContactSuccess(contactId, res.data as any),
          ]);
          expect(getAllByContact.mock.calls.length).toBe(1);
          expect(getAllByContact.mock.calls[0]).toEqual([
            contactId,
            fetchedPageCount + 1,
          ]);
        });

        it('should trigger fetch action (failed)', async () => {
          const error = new Error();
          const fetchedPageCount = 0;
          const getState = () => ({
            contacts: {
              [contactId]: {},
            },
            getNotesByContact: {
              isFetching: false,
              fetchedPageCount: {
                [contactId]: fetchedPageCount,
              },
            },
          });
          getAllByContact.mockReturnValue(Promise.reject(error));
          await getNotesByContact(contactId)(dispatch, getState);
          expect(dispatch.mock.calls.length).toBe(2);
          expect(dispatch.mock.calls[0]).toEqual([
            getNotesByContactFetched(contactId),
          ]);
          expect(dispatch.mock.calls[1]).toEqual([
            getNotesByContactFailed(error),
          ]);
          expect(getAllByContact.mock.calls.length).toBe(1);
          expect(getAllByContact.mock.calls[0]).toEqual([
            contactId,
            fetchedPageCount + 1,
          ]);
        });
      });
    });
  });
});
