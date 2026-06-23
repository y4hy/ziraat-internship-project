namespace ziraat.Api.Validation;

public static class NationalIdValidator
{
    public static bool IsValidNationalId(string number)
    {
        if (number.Length != 11) return false;
        if (!number.All(char.IsDigit)) return false;
        if (number[0] == '0') return false;

        int[] digits = number.Select(c => c - '0').ToArray();

        // (sum of digits at odd positions 1,3,5,7,9) * 7 - (sum of digits at even positions 2,4,6,8)
        // positions are 1-indexed, so indices 0,2,4,6,8 are odd positions
        int oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
        int evenSum = digits[1] + digits[3] + digits[5] + digits[7];
        int check1 = ((oddSum * 7) - evenSum) % 10;
        if (check1 != digits[9]) return false;

        int totalSum = digits.Take(10).Sum();
        if (totalSum % 10 != digits[10]) return false;

        return true;
    }

    public static bool IsValidTaxNumber(string number)
    {
        return number.Length >= 8 && number.Length <= 10 && number.All(char.IsDigit);
    }

    public static bool StartsWithForeignPrefix(string number)
    {
        return number.StartsWith("99");
    }
}
