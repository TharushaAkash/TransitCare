namespace SriLankaTransportComplaints.Api.Models;

public static class ComplaintStatuses
{
    public const string Submitted = "Submitted";
    public const string InReview = "InReview";
    public const string Resolved = "Resolved";
    public const string Rejected = "Rejected";

    public static readonly string[] Allowed =
    {
        Submitted,
        InReview,
        Resolved,
        Rejected
    };
}
