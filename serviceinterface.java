@Service
public class LzwCodec {
    public List<Integer> compress(String input);
    public String decompress(List<Integer> codes);
}
